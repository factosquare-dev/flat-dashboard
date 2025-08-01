import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowUp, ArrowDown, Users, FolderOpen, Package, TrendingUp } from 'lucide-react';
import { useStore } from '@/store';
import { ProjectStatus } from '@/types/enums';
import { logError } from '@/utils/errorHandling';
import { LoadingState } from '@/components/loading/LoadingState';
import { EmptyState } from '@/components/common';

const Dashboard: React.FC = () => {
  const { projects } = useStore();
  const MAX_DASHBOARD_PROJECTS = 5; // Display limit for recent projects
  
  // Error handling for projects
  const safeProjects = useMemo(() => {
    try {
      return projects ?? [];
    } catch (error) {
      logError('Dashboard', error, { context: 'Loading projects' });
      return [];
    }
  }, [projects]);

  const stats = [
    {
      title: 'Total Projects',
      value: safeProjects.length.toString(),
      description: '+12% from last month',
      icon: FolderOpen,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Users',
      value: '2,345', // TODO: Replace with actual user count from MockDB
      description: '+5% from last month',
      icon: Users,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Products',
      value: '1,234',
      description: '-2% from last month',
      icon: Package,
      trend: 'down',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Revenue',
      value: '$45,678',
      description: '+18% from last month',
      icon: TrendingUp,
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects today.</p>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 flex items-center mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <LoadingState
              isLoading={false}
              error={null}
              isEmpty={safeProjects.length === 0}
              emptyComponent={
                <EmptyState
                  icon={<FolderOpen />}
                  title="프로젝트 없음"
                  description="아직 등록된 프로젝트가 없습니다"
                />
              }
            >
              <div className="space-y-4">
                {safeProjects.slice(0, MAX_DASHBOARD_PROJECTS).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-600">{project.manufacturer}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === ProjectStatus.IN_PROGRESS ? 'bg-green-100 text-green-800' :
                    project.status === ProjectStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                ))}
              </div>
            </LoadingState>
            <Button variant="outline" className="w-full mt-4">
              View all projects
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                leftIcon={<FolderOpen className="h-4 w-4" />}
                onClick={() => {
                  try {
                    // TODO: Navigate to new project
                  } catch (error) {
                    logError('Dashboard', error, { action: 'New Project' });
                  }
                }}
              >
                New Project
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<Package className="h-4 w-4" />}
                onClick={() => {
                  try {
                    // TODO: Navigate to add product
                  } catch (error) {
                    logError('Dashboard', error, { action: 'Add Product' });
                  }
                }}
              >
                Add Product
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<Users className="h-4 w-4" />}
                onClick={() => {
                  try {
                    // TODO: Navigate to invite user
                  } catch (error) {
                    logError('Dashboard', error, { action: 'Invite User' });
                  }
                }}
              >
                Invite User
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<TrendingUp className="h-4 w-4" />}
                onClick={() => {
                  try {
                    // TODO: Navigate to reports
                  } catch (error) {
                    logError('Dashboard', error, { action: 'View Reports' });
                  }
                }}
              >
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;