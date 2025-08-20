/**
 * Custom Field Types for flexible data storage
 */

export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  RATING = 'rating',
  TAGS = 'tags',
  USER = 'user',
  FILE = 'file',
  RICH_TEXT = 'rich_text'
}

export enum CustomFieldEntity {
  PROJECT = 'project',
  TASK = 'task',
  FACTORY = 'factory',
  CUSTOMER = 'customer',
  PRODUCT = 'product'
}

/**
 * Custom Field Definition
 * Defines the structure and metadata of a custom field
 */
export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: CustomFieldType;
  entityType: CustomFieldEntity;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>; // For SELECT/MULTISELECT
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customValidator?: string; // Function name to call for validation
  };
  displayOptions?: {
    width?: string;
    showInTable?: boolean;
    showInDetail?: boolean;
    showInForm?: boolean;
    position?: number;
    groupName?: string;
  };
  metadata?: {
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
    isSystem?: boolean; // System fields can't be deleted
    isDeprecated?: boolean;
  };
}

/**
 * Custom Field Value
 * Stores the actual value of a custom field for an entity
 */
export interface CustomFieldValue {
  id: string;
  fieldId: string; // References CustomFieldDefinition.id
  entityId: string; // ID of the entity (project, task, etc.)
  entityType: CustomFieldEntity;
  value: any;
  metadata?: {
    updatedBy?: string;
    updatedAt?: Date;
    version?: number;
  };
}

/**
 * Custom Field Group
 * Groups related custom fields together for better organization
 */
export interface CustomFieldGroup {
  id: string;
  name: string;
  description?: string;
  entityType: CustomFieldEntity;
  fields: string[]; // Array of CustomFieldDefinition.id
  displayOrder?: number;
  isCollapsible?: boolean;
  isDefaultExpanded?: boolean;
}

/**
 * Custom Field Template
 * Predefined sets of custom fields that can be applied to entities
 */
export interface CustomFieldTemplate {
  id: string;
  name: string;
  description?: string;
  entityType: CustomFieldEntity;
  fields: Partial<CustomFieldDefinition>[];
  isDefault?: boolean;
  category?: string;
}

/**
 * Helper type for memo fields (simplified custom field)
 */
export interface MemoField extends CustomFieldDefinition {
  type: CustomFieldType.TEXT | CustomFieldType.RICH_TEXT;
  entityType: CustomFieldEntity.PROJECT;
}

/**
 * Dynamic column configuration for table views
 */
export interface DynamicColumn {
  id: string;
  fieldId: string; // References CustomFieldDefinition.id
  label: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  formatter?: string; // Function name for custom formatting
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'concat';
}