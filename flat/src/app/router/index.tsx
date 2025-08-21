import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from '@/app/layouts/MainLayout/index';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/modules/dashboard/index'));
const Projects = lazy(() => import('@/modules/projects/ProjectsPage'));
const MasterProjectDetail = lazy(() => import('@/modules/projects/MasterProjectDetail'));
const SubProjectDetail = lazy(() => import('@/modules/projects/SubProjectDetail'));
const IndependentProjectDetail = lazy(() => import('@/modules/projects/IndependentProjectDetail'));
const Comments = lazy(() => import('@/pages/Comments'));
const Users = lazy(() => import('@/modules/users/index'));
const Factories = lazy(() => import('@/modules/factories/index'));
const ProductTypes = lazy(() => import('@/modules/products/index'));
const Maintenance = lazy(() => import('@/misc/index'));
const NotFound = lazy(() => import('@/misc/NotFound'));

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
        path: 'projects/master/:projectId',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <MasterProjectDetail />
          </Suspense>
        ),
      },
      {
        path: 'projects/sub/:projectId',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <SubProjectDetail />
          </Suspense>
        ),
      },
      {
        path: 'projects/independent/:projectId',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <IndependentProjectDetail />
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
        path: 'comments',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Comments />
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