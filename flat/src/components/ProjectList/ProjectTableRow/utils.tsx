import React from 'react';
import { 
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  FileText,
  Package,
  Truck,
  Settings
} from 'lucide-react';

export const getTaskIcon = (iconType?: string) => {
  switch (iconType) {
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'package':
      return <Package className="w-4 h-4" />;
    case 'truck':
      return <Truck className="w-4 h-4" />;
    case 'settings':
      return <Settings className="w-4 h-4" />;
    default:
      return null;
  }
};

export const getStatusIcon = (status?: string, completed?: boolean) => {
  if (completed) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  
  switch (status) {
    case 'in-progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'delayed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Circle className="w-4 h-4 text-gray-400" />;
  }
};

export const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};