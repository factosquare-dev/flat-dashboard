// Context exports for easy import
export { AppProvider, useAppContext, useProjectContext, useCustomerContext, useTaskContext } from './AppContext';
export { AuthProvider, useAuth, useUser, useAuthActions } from './AuthContext';
export { MemoProvider, useMemoContext } from './MemoContext';

// Combined providers for app root
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { QueryProvider } from '../providers/query/QueryProvider';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';
import { MemoProvider } from './MemoContext';

interface RootProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export const RootProviders: React.FC<RootProvidersProps> = ({ 
  children, 
  queryClient 
}) => {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppProvider>
          <MemoProvider>
            {children}
          </MemoProvider>
        </AppProvider>
      </AuthProvider>
    </QueryProvider>
  );
};