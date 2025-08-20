import React, { useMemo, useState, useEffect } from 'react';
import Card from '@/shared/components/Card/index';
import { Button } from '@/shared/components/Button';
import { ArrowUp, ArrowDown, Users, FolderOpen, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/core/store';
import { ProjectStatus } from '@/shared/types/enums';
import { logError } from '@/shared/utils/error';
import { LoadingState } from '@/shared/components/LoadingState';
import EmptyState from '@/shared/components/EmptyState';
import { PageErrorBoundary } from '@/shared/components/PageErrorBoundary';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';

const DashboardContent: React.FC = () => {
  const { projects } = useStore();
  const navigate = useNavigate();
  const MAX_DASHBOARD_PROJECTS = 5; // Display limit for recent projects
  const [counts, setCounts] = useState({ users: 0, products: 0 });
  
  useEffect(() => {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    setCounts({
      users: database.users.size,
      products: database.products.size
    });
  }, []);
  
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
      value: counts.users.toLocaleString(),
      description: '+5% from last month',
      icon: Users,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Products',
      value: counts.products.toLocaleString(),
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
            <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 flex items-center mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {stat.description}
              </p>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <p className="text-sm text-gray-600">Your most recently updated projects</p>
          </Card.Header>
          <Card.Body>
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
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                leftIcon={<FolderOpen className="h-4 w-4" />}
                onClick={() => {
                  try {
                    navigate('/projects');
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
                    navigate('/products');
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
                    navigate('/users');
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
                    navigate('/reports');
                  } catch (error) {
                    logError('Dashboard', error, { action: 'View Reports' });
                  }
                }}
              >
                View Reports
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <PageErrorBoundary>
      <DashboardContent />
    </PageErrorBoundary>
  );
};

export default Dashboard;