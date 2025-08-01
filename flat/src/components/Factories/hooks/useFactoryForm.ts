import { useState, useEffect } from 'react';
import type { CertificationType, FactoryManager } from '../../../data/factories';
import { FactoryType, FactoryTypeLabel } from '@/types/enums';

export interface FactoryFormData {
  id?: string;
  name: string;
  type: FactoryType; // Using enum for type safety
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications: CertificationType[];
  managers: FactoryManager[];
}

const initialFormData: FactoryFormData = {
  name: '',
  type: FactoryType.MANUFACTURING,
  address: '',
  contact: '',
  email: '',
  capacity: '',
  certifications: [],
  managers: []
};

export const useFactoryForm = (editData?: FactoryFormData | null, isOpen?: boolean) => {
  const [formData, setFormData] = useState<FactoryFormData>(initialFormData);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [newManager, setNewManager] = useState<FactoryManager>({
    name: '',
    email: '',
    phone: '',
    position: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(initialFormData);
    }
  }, [editData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCertificationToggle = (cert: CertificationType) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleManagerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewManager(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddManager = () => {
    if (newManager.name && newManager.email && newManager.phone && newManager.position) {
      setFormData(prev => ({
        ...prev,
        managers: [...prev.managers, newManager]
      }));
      setNewManager({ name: '', email: '', phone: '', position: '' });
      setShowManagerForm(false);
    }
  };

  const handleRemoveManager = (index: number) => {
    setFormData(prev => ({
      ...prev,
      managers: prev.managers.filter((_, i) => i !== index)
    }));
  };

  const resetManager = () => {
    setNewManager({ name: '', email: '', phone: '', position: '' });
    setShowManagerForm(false);
  };

  return {
    formData,
    showManagerForm,
    newManager,
    setShowManagerForm,
    handleInputChange,
    handleCertificationToggle,
    handleManagerInputChange,
    handleAddManager,
    handleRemoveManager,
    resetManager
  };
};