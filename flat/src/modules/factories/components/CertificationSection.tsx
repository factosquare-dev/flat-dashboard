import React from 'react';
import type { CertificationType } from '@/core/database/factories';

interface CertificationSectionProps {
  certifications: CertificationType[];
  availableCertifications: CertificationType[];
  onCertificationToggle: (cert: CertificationType) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({
  certifications,
  availableCertifications,
  onCertificationToggle
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        인증서
      </label>
      <div className="grid grid-cols-3 gap-2">
        {availableCertifications.map(cert => (
          <label key={cert} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={certifications.includes(cert)}
              onChange={() => onCertificationToggle(cert)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm">{cert}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CertificationSection;