import React, { Suspense, lazy, ComponentType } from 'react';
import { reducedMotion } from './accessibility';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

// Lazy loading wrapper with error boundary
interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  fallback: Fallback = LoadingSpinner,
  errorFallback: ErrorFallback = DefaultErrorFallback,
}) => {
  const LazyLoadedComponent = lazy(component);

  return (
    <LazyErrorBoundary ErrorFallback={ErrorFallback}>
      <Suspense fallback={<Fallback />}>
        <LazyLoadedComponent />
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        컴포넌트 로딩 오류
      </h3>
      <p className="text-gray-600 mb-4">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <button
        onClick={retry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        다시 시도
      </button>
    </div>
  </div>
);

// Error boundary for lazy components
interface LazyErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; ErrorFallback: React.ComponentType<{ error: Error; retry: () => void }> },
  LazyErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.ErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Preload utility for better UX
export const preloadComponent = (componentImport: () => Promise<{ default: ComponentType<any> }>) => {
  // Only preload if not on slow connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return;
    }
  }

  // Preload the component
  componentImport();
};

// Route-based lazy loading with preloading
export const createLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  preloadDelay: number = 0
) => {
  // Preload after delay (for hover or likely navigation)
  if (preloadDelay > 0) {
    setTimeout(() => preloadComponent(importFn), preloadDelay);
  }

  return lazy(importFn);
};

// Intersection Observer based lazy loading for components
export const useLazyObserver = (
  threshold: number = 0.1,
  rootMargin: string = '50px'
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [element, setElement] = React.useState<Element | null>(null);

  React.useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, threshold, rootMargin]);

  return [setElement, isVisible] as const;
};

// Lazy loading with intersection observer
export const LazyIntersectionComponent: React.FC<{
  component: () => Promise<{ default: ComponentType<any> }>;
  placeholder?: React.ComponentType;
  threshold?: number;
  rootMargin?: string;
}> = ({ component, placeholder: Placeholder, threshold, rootMargin }) => {
  const [setRef, isVisible] = useLazyObserver(threshold, rootMargin);

  if (!isVisible) {
    const DefaultPlaceholder = () => <div className="h-32" />;
    return (
      <div ref={setRef}>
        {Placeholder ? <Placeholder /> : <DefaultPlaceholder />}
      </div>
    );
  }

  return <LazyComponent component={component} />;
};

// Progressive loading with skeleton
export const ProgressiveLoadingWrapper: React.FC<{
  children: React.ReactNode;
  skeleton: React.ComponentType;
  delay?: number;
}> = ({ children, skeleton: Skeleton, delay = 200 }) => {
  const [showContent, setShowContent] = React.useState(false);
  const [showSkeleton, setShowSkeleton] = React.useState(false);
  const isReducedMotion = reducedMotion.isEnabled();

  React.useEffect(() => {
    // Show skeleton after small delay to avoid flash
    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, 100);

    // Show content after delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, delay);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(contentTimer);
    };
  }, [delay]);

  if (!showContent) {
    return showSkeleton ? <Skeleton /> : null;
  }

  return (
    <div 
      className={`${
        isReducedMotion 
          ? '' 
          : 'animate-in fade-in duration-300'
      }`}
    >
      {children}
    </div>
  );
};

// Bundle size aware loading
export const BundleSizeAwareLoader: React.FC<{
  lightComponent: () => Promise<{ default: ComponentType<any> }>;
  heavyComponent: () => Promise<{ default: ComponentType<any> }>;
  sizeThreshold?: number; // in KB
}> = ({ lightComponent, heavyComponent, sizeThreshold = 1000 }) => {
  const [useHeavyComponent, setUseHeavyComponent] = React.useState(false);

  React.useEffect(() => {
    // Check available bandwidth/connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && 
        (connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.downlink < 1.5);

      setUseHeavyComponent(!isSlowConnection);
    } else {
      // Default to heavy component if can't detect connection
      setUseHeavyComponent(true);
    }
  }, []);

  return (
    <LazyComponent 
      component={useHeavyComponent ? heavyComponent : lightComponent} 
    />
  );
};