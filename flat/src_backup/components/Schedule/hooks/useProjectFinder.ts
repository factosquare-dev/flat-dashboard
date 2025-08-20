export const useProjectFinder = (scrollRef: React.RefObject<HTMLDivElement>) => {
  const findProjectFromEvent = (e: React.DragEvent): string | null => {
    // First try to find project by traversing up the DOM
    let element: HTMLElement | null = e.target as HTMLElement;
    let projectRow: HTMLElement | null = null;
    let searchDepth = 0;
    const maxSearchDepth = 20; // Prevent infinite loops
    
    // Keep searching up until we find a project row
    while (element && !projectRow && searchDepth < maxSearchDepth) {
      if (element.hasAttribute('data-project-id')) {
        projectRow = element;
        break;
      }
      element = element.parentElement;
      searchDepth++;
    }
    
    // If we couldn't find a project row by traversing up, try to find the closest one based on mouse Y position
    if (!projectRow && scrollRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      
      // Find all project rows
      const allProjectRows = scrollRef.current.querySelectorAll('[data-project-id]');
      let closestRow: HTMLElement | null = null;
      let closestDistance = Infinity;
      
      allProjectRows.forEach((row) => {
        const rowRect = row.getBoundingClientRect();
        const rowTop = rowRect.top - rect.top;
        const rowBottom = rowRect.bottom - rect.top;
        
        // Check if mouse is within this row's Y bounds
        if (relativeY >= rowTop && relativeY <= rowBottom) {
          closestRow = row as HTMLElement;
          closestDistance = 0;
        } else {
          // Calculate distance to row
          const distance = Math.min(
            Math.abs(relativeY - rowTop),
            Math.abs(relativeY - rowBottom)
          );
          if (distance < closestDistance) {
            closestDistance = distance;
            closestRow = row as HTMLElement;
          }
        }
      });
      
      projectRow = closestRow;
    }
    
    if (projectRow) {
      const projectId = projectRow.getAttribute('data-project-id');
      if (projectId && projectId !== 'ADD_FACTORY_ROW_ID') {
        return projectId;
      }
    }
    
    return null;
  };

  return { findProjectFromEvent };
};