import type { UserRole } from '../../../store/slices/userSlice';

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => void;
  editData?: UserFormData | null;
}

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  position?: string;
}

export type FormErrors = Partial<Record<keyof UserFormData, string>>;