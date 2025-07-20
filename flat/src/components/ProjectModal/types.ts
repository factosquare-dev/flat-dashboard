export interface ProjectData {
  id?: string;
  client: string;
  manager: string;
  productType: string;
  serviceType: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  manufacturer: string;
  container: string;
  packaging: string;
  sales: string;
  purchase: string;
  description?: string;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectData) => void;
  editData?: ProjectData | null;
  mode: 'create' | 'edit';
}