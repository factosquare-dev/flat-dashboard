import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FormSectionProps<T = any> {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export interface FormRowProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}