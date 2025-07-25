import { useState, useEffect } from 'react';

interface ContainerStyle {
  top: string;
  left: string;
}

export const useDynamicLayout = () => {
  const [containerStyle, setContainerStyle] = useState<ContainerStyle>({ 
    top: '64px', 
    left: '256px' 
  });
  
  const [debugInfo, setDebugInfo] = useState<{ 
    sidebarSelector: string; 
    sidebarWidth: number; 
    sidebarClasses: string 
  }>({
    sidebarSelector: '',
    sidebarWidth: 0,
    sidebarClasses: ''
  });
  
  // Force recalculation when sidebar state changes
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let sidebarEventListeners: Array<{ element: Element; event: string; handler: EventListener }> = [];
    
    const calculateMargins = () => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        rafId = null;
        
        // Find header height
        const header = document.querySelector('header') || 
                      document.querySelector('[role="banner"]') || 
                      document.querySelector('.header') || 
                      document.querySelector('nav');
        const headerHeight = header ? header.getBoundingClientRect().height : 64;
        
        // Find sidebar width
        let sidebarWidth = 256;
        let sidebarClasses = '';
        let foundSelector = '';
        
        // First check main element's margin-left as it reflects sidebar state
        const main = document.querySelector('main');
        if (main) {
          const computedStyle = window.getComputedStyle(main);
          const marginLeft = parseFloat(computedStyle.marginLeft);
          if (marginLeft > 0) {
            sidebarWidth = marginLeft;
            foundSelector = 'main.margin-left';
            sidebarClasses = 'detected from main margin';
          }
        }
        
        // Fallback to finding sidebar directly
        if (!foundSelector) {
          const sidebarSelectors = [
            '.flex-1.flex.flex-col.overflow-y-auto',
            'aside',
            '[role="navigation"]',
            '.sidebar',
            '[data-sidebar]',
            '.side-nav',
            '.navigation',
            '#sidebar'
          ];
          
          let sidebar = null;
          for (const selector of sidebarSelectors) {
            sidebar = document.querySelector(selector);
            if (sidebar) {
              foundSelector = selector;
              break;
            }
          }
          
          if (sidebar) {
            const rect = sidebar.getBoundingClientRect();
            sidebarWidth = rect.width;
            sidebarClasses = sidebar.className || sidebar.getAttribute('class') || 'no classes';
            
            // Check collapsed state
            const isCollapsed = 
              sidebar.classList.contains('collapsed') ||
              sidebar.classList.contains('closed') ||
              sidebar.getAttribute('data-collapsed') === 'true' ||
              sidebar.getAttribute('aria-expanded') === 'false' ||
              rect.width < 100;
            
            if (isCollapsed) {
              sidebarWidth = rect.width > 0 ? rect.width : 64;
            }
          }
        } else {
          // Fallback: search for sidebar-like elements
          const allElements = document.querySelectorAll('*');
          let possibleSidebars = [];
          
          allElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.left === 0 && 
                rect.top <= 100 && 
                rect.height > window.innerHeight * 0.5 &&
                rect.width > 50 && 
                rect.width < 400) {
              possibleSidebars.push({
                element: el,
                selector: el.tagName.toLowerCase() + 
                         (el.id ? '#' + el.id : '') + 
                         (el.className ? '.' + el.className.split(' ').join('.') : ''),
                width: rect.width,
                classes: el.className || ''
              });
            }
          });
          
          if (possibleSidebars.length > 0) {
            possibleSidebars.sort((a, b) => a.width - b.width);
            const found = possibleSidebars[0];
            foundSelector = found.selector;
            sidebarWidth = found.width;
            sidebarClasses = found.classes;
          }
        }
        
        setDebugInfo({
          sidebarSelector: foundSelector || 'NOT FOUND',
          sidebarWidth,
          sidebarClasses
        });
        
        setContainerStyle({
          top: `${headerHeight}px`,
          left: `${sidebarWidth}px`
        });
      });
    };
    
    // Initial calculation
    calculateMargins();
    
    // Event listeners
    window.addEventListener('resize', calculateMargins);
    
    // ResizeObserver for more efficient sidebar size tracking
    const resizeObserver = new ResizeObserver(() => {
      calculateMargins();
      setForceUpdate(prev => prev + 1);
    });
    
    // Watch for main element margin changes (sidebar state indicator)
    const mainElement = document.querySelector('main');
    if (mainElement) {
      resizeObserver.observe(mainElement);
    }
    
    const sidebar = document.querySelector('aside') || 
                   document.querySelector('[role="navigation"]') || 
                   document.querySelector('.sidebar') ||
                   document.querySelector('.flex-1.flex.flex-col.overflow-y-auto');
    if (sidebar) {
      resizeObserver.observe(sidebar);
    }
    
    // Sidebar transition events
    timeoutId = setTimeout(() => {
      const sidebar = document.querySelector('.flex-1.flex.flex-col.overflow-y-auto');
      if (sidebar) {
        // Add event listeners and track them for cleanup
        const addTrackedListener = (element: Element, event: string, handler: EventListener) => {
          element.addEventListener(event, handler);
          sidebarEventListeners.push({ element, event, handler });
        };
        
        addTrackedListener(sidebar, 'transitionstart', calculateMargins);
        addTrackedListener(sidebar, 'transitionend', calculateMargins);
        
        // Toggle button click handling
        const toggleButton = document.querySelector('[class*="toggle"]') || 
                           document.querySelector('[class*="collapse"]') || 
                           document.querySelector('[aria-label*="toggle"]') ||
                           document.querySelector('button svg');
                           
        if (toggleButton && toggleButton instanceof HTMLElement) {
          const handleSidebarClick = (e: MouseEvent) => {
            const rect = sidebar.getBoundingClientRect();
            if (e.clientY - rect.top < 100) {
              toggleButton.click();
            }
          };
          
          addTrackedListener(sidebar, 'click', handleSidebarClick);
        }
      }
    }, 500);
    
    // MutationObserver for sidebar changes
    const observer = new MutationObserver(() => {
      calculateMargins();
      setForceUpdate(prev => prev + 1);
    });
    
    const sidebarElement = document.querySelector('aside') || 
                          document.querySelector('[role="navigation"]') || 
                          document.querySelector('.sidebar');
    if (sidebarElement && sidebarElement.parentElement) {
      observer.observe(sidebarElement, { 
        attributes: true, 
        attributeFilter: ['class', 'style', 'data-collapsed'],
        subtree: true 
      });
      observer.observe(sidebarElement.parentElement, { 
        attributes: true, 
        childList: true,
        subtree: true 
      });
    }
    
    // Listen for transition events on main element
    if (mainElement) {
      const handleTransition = () => {
        calculateMargins();
        setForceUpdate(prev => prev + 1);
      };
      mainElement.addEventListener('transitionend', handleTransition);
      mainElement.addEventListener('transitionstart', handleTransition);
      
      // Cleanup
      sidebarEventListeners.push({ element: mainElement, event: 'transitionend', handler: handleTransition });
      sidebarEventListeners.push({ element: mainElement, event: 'transitionstart', handler: handleTransition });
    }
    
    return () => {
      // Clean up all event listeners
      window.removeEventListener('resize', calculateMargins);
      resizeObserver.disconnect();
      observer.disconnect();
      
      // Clear timeout if it hasn't fired yet
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Remove all tracked sidebar event listeners
      sidebarEventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return { containerStyle, debugInfo };
};