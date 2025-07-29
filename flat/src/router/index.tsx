import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Projects = lazy(() => import('../pages/Projects'));
const Users = lazy(() => import('../pages/Users'));
const Factories = lazy(() => import('../pages/Factories'));
const ProductTypes = lazy(() => import('../pages/ProductTypes'));
const NotFound = lazy(() => import('../pages/NotFound'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'projects',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Projects />
          </Suspense>
        ),
      },
      {
        path: 'samples',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Projects />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: 'factories',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Factories />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProductTypes />
          </Suspense>
        ),
      },
      {
        path: '404',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <NotFound />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};