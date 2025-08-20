import React from 'react';
import type { CertificationType } from '@/data/factories';
import { CERTIFICATE_TYPE_OPTIONS, FACTORY_FORM_LABELS } from '@/constants';

interface CertificationFormProps {
  certifications: CertificationType[];
  onToggle: (cert: CertificationType) => void;
}

export const CertificationForm: React.FC<CertificationFormProps> = ({ 
  certifications, 
  onToggle 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{FACTORY_FORM_LABELS.CERTIFICATIONS}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CERTIFICATE_TYPE_OPTIONS.map(cert => (
          <label key={cert} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={certifications.includes(cert as CertificationType)}
              onChange={() => onToggle(cert as CertificationType)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm">{cert}</span>
          </label>
        ))}
      </div>
    </div>
  );
};