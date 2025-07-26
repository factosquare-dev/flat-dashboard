import React from 'react';
import type { FactoryFormData } from './types';
import { FACTORY_FORM_LABELS } from '../../../constants';
import { FactoryType, FactoryTypeLabel } from '../../../types/enums';

interface BasicInfoFormProps {
  formData: FactoryFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, onChange }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{FACTORY_FORM_LABELS.BASIC_INFO}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {FACTORY_FORM_LABELS.FACTORY_NAME} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {FACTORY_FORM_LABELS.FACTORY_TYPE} <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(FactoryTypeLabel).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {FACTORY_FORM_LABELS.ADDRESS} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {FACTORY_FORM_LABELS.CONTACT} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={onChange}
            required
            placeholder="02-0000-0000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {FACTORY_FORM_LABELS.EMAIL} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            생산 능력 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="capacity"
            value={formData.capacity}
            onChange={onChange}
            required
            placeholder="예: 월 100톤"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};