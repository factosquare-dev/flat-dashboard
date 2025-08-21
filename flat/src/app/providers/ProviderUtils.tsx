/**
 * Context provider utilities with performance optimizations
 */

import React, { useMemo } from 'react';

interface MemoizedProviderProps<T> {
  value: T;
  children: React.ReactNode;
  context: React.Context<T>;
  dependencies?: any[];
}

/**
 * Generic memoized provider component
 */
function MemoizedProvider<T>({
  value,
  children,
  context: Context,
  dependencies = [],
}: MemoizedProviderProps<T>) {
  const memoizedValue = useMemo(() => value, dependencies);

  return (
    <Context.Provider value={memoizedValue}>
      {children}
    </Context.Provider>
  );
}

/**
 * HOC for creating memoized providers
 */
export function withMemoizedProvider<T>(
  Context: React.Context<T>,
  useValue: () => T,
  dependencies?: (value: T) => any[]
) {
  return React.memo<{ children: React.ReactNode }>(({ children }) => {
    const value = useValue();
    const deps = dependencies ? dependencies(value) : [value];
    
    return (
      <MemoizedProvider
        value={value}
        context={Context}
        dependencies={deps}
      >
        {children}
      </MemoizedProvider>
    );
  });
}

/**
 * Multi-provider component for nested providers
 */
interface MultiProviderProps {
  providers: Array<{
    provider: React.ComponentType<{ children: React.ReactNode }>;
    props?: Record<string, any>;
  }>;
  children: React.ReactNode;
}

export const MultiProvider: React.FC<MultiProviderProps> = React.memo(({
  providers,
  children,
}) => {
  const memoizedProviders = useMemo(() => providers, [providers]);

  return memoizedProviders.reduceRight(
    (acc, { provider: Provider, props = {} }) => (
      <Provider {...props}>{acc}</Provider>
    ),
    children
  );
});

MultiProvider.displayName = 'MultiProvider';

/**
 * Context selector hook for performance
 */
export function createContextSelector<T>() {
  return function useContextSelector<S>(
    context: React.Context<T>,
    selector: (value: T) => S
  ): S {
    const contextValue = React.useContext(context);
    return useMemo(() => selector(contextValue), [contextValue, selector]);
  };
}

/**
 * Split context pattern - separates state and actions
 */
export function createSplitContext<T>() {
  const StateContext = React.createContext<T | null>(null);
  const ActionsContext = React.createContext<any>(null);

  function Provider({ 
    children, 
    state, 
    actions 
  }: { 
    children: React.ReactNode;
    state: T;
    actions: any;
  }) {
    const memoizedState = useMemo(() => state, [state]);
    const memoizedActions = useMemo(() => actions, [actions]);

    return (
      <StateContext.Provider value={memoizedState}>
        <ActionsContext.Provider value={memoizedActions}>
          {children}
        </ActionsContext.Provider>
      </StateContext.Provider>
    );
  }

  function useState() {
    const context = React.useContext(StateContext);
    if (context === null) {
      throw new Error('useState must be used within Provider');
    }
    return context;
  }

  function useActions() {
    const context = React.useContext(ActionsContext);
    if (context === null) {
      throw new Error('useActions must be used within Provider');
    }
    return context;
  }

  return { Provider: React.memo(Provider), useState, useActions };
}

export default MemoizedProvider;