// Context exports for easy import
export { AppProvider, useAppContext, useProjectContext, useCustomerContext, useTaskContext } from './AppContext';
export { AuthProvider, useAuth, useUser, useAuthActions } from './AuthContext';

// Combined providers for app root
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { QueryProvider } from '../lib/react-query/QueryProvider';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './AppContext';

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
          {children}
        </AppProvider>
      </AuthProvider>
    </QueryProvider>
  );
};