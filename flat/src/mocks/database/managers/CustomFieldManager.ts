/**
 * Custom Field Manager
 * Manages dynamic custom fields for various entities
 */

import type { MockDatabase } from '../types';
import type { 
  CustomFieldDefinition, 
  CustomFieldValue, 
  CustomFieldGroup,
  CustomFieldTemplate,
  CustomFieldType,
  CustomFieldEntity,
  MemoField
} from '@/types/customField';
import { v4 as uuidv4 } from 'uuid';

export class CustomFieldManager {
  private db: MockDatabase;

  constructor(database: MockDatabase) {
    this.db = database;
    
    // Ensure custom field collections are initialized
    if (!this.db.customFieldDefinitions) {
      this.db.customFieldDefinitions = new Map();
    }
    if (!this.db.customFieldValues) {
      this.db.customFieldValues = new Map();
    }
    if (!this.db.customFieldGroups) {
      this.db.customFieldGroups = new Map();
    }
    if (!this.db.customFieldTemplates) {
      this.db.customFieldTemplates = new Map();
    }
  }

  /**
   * Field Definition CRUD Operations
   */
  
  createFieldDefinition(field: Omit<CustomFieldDefinition, 'id'>): CustomFieldDefinition {
    const newField: CustomFieldDefinition = {
      id: `field-${uuidv4()}`,
      ...field,
      metadata: {
        ...field.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.db.customFieldDefinitions.set(newField.id, newField);
    return newField;
  }

  updateFieldDefinition(fieldId: string, updates: Partial<CustomFieldDefinition>): CustomFieldDefinition | null {
    const field = this.db.customFieldDefinitions.get(fieldId);
    if (!field) return null;

    // System fields cannot be modified
    if (field.metadata?.isSystem) {
      console.warn(`Cannot modify system field: ${fieldId}`);
      return field;
    }

    const updatedField: CustomFieldDefinition = {
      ...field,
      ...updates,
      id: field.id, // Ensure ID doesn't change
      metadata: {
        ...field.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    };

    this.db.customFieldDefinitions.set(fieldId, updatedField);
    return updatedField;
  }

  deleteFieldDefinition(fieldId: string): boolean {
    const field = this.db.customFieldDefinitions.get(fieldId);
    if (!field) return false;

    // System fields cannot be deleted
    if (field.metadata?.isSystem) {
      console.warn(`Cannot delete system field: ${fieldId}`);
      return false;
    }

    // Delete the field definition
    this.db.customFieldDefinitions.delete(fieldId);

    // Delete all values associated with this field
    const valuesToDelete: string[] = [];
    this.db.customFieldValues.forEach((value, key) => {
      if (value.fieldId === fieldId) {
        valuesToDelete.push(key);
      }
    });
    valuesToDelete.forEach(key => this.db.customFieldValues.delete(key));

    // Remove from groups
    this.db.customFieldGroups.forEach(group => {
      group.fields = group.fields.filter(id => id !== fieldId);
    });

    return true;
  }

  getFieldDefinition(fieldId: string): CustomFieldDefinition | undefined {
    return this.db.customFieldDefinitions.get(fieldId);
  }

  getFieldDefinitionsByEntity(entityType: CustomFieldEntity): CustomFieldDefinition[] {
    return Array.from(this.db.customFieldDefinitions.values())
      .filter(field => field.entityType === entityType);
  }

  /**
   * Field Value CRUD Operations
   */

  setFieldValue(
    entityId: string, 
    entityType: CustomFieldEntity, 
    fieldId: string, 
    value: any,
    userId?: string
  ): CustomFieldValue {
    // Validate field exists and matches entity type
    const field = this.db.customFieldDefinitions.get(fieldId);
    if (!field || field.entityType !== entityType) {
      throw new Error(`Invalid field ${fieldId} for entity type ${entityType}`);
    }

    // Validate value against field definition
    if (!this.validateFieldValue(field, value)) {
      throw new Error(`Invalid value for field ${field.name}`);
    }

    // Check if value already exists
    const existingKey = `${entityId}-${fieldId}`;
    const existing = this.db.customFieldValues.get(existingKey);

    const fieldValue: CustomFieldValue = {
      id: existingKey,
      fieldId,
      entityId,
      entityType,
      value,
      metadata: {
        updatedBy: userId,
        updatedAt: new Date(),
        version: existing ? (existing.metadata?.version || 0) + 1 : 1
      }
    };

    this.db.customFieldValues.set(existingKey, fieldValue);
    return fieldValue;
  }

  getFieldValue(entityId: string, fieldId: string): CustomFieldValue | undefined {
    const key = `${entityId}-${fieldId}`;
    return this.db.customFieldValues.get(key);
  }

  getFieldValues(entityId: string, entityType?: CustomFieldEntity): CustomFieldValue[] {
    const values: CustomFieldValue[] = [];
    this.db.customFieldValues.forEach(value => {
      if (value.entityId === entityId && (!entityType || value.entityType === entityType)) {
        values.push(value);
      }
    });
    return values;
  }

  deleteFieldValue(entityId: string, fieldId: string): boolean {
    const key = `${entityId}-${fieldId}`;
    return this.db.customFieldValues.delete(key);
  }

  /**
   * Field Groups Management
   */

  createFieldGroup(group: Omit<CustomFieldGroup, 'id'>): CustomFieldGroup {
    const newGroup: CustomFieldGroup = {
      id: `group-${uuidv4()}`,
      ...group
    };

    this.db.customFieldGroups.set(newGroup.id, newGroup);
    return newGroup;
  }

  updateFieldGroup(groupId: string, updates: Partial<CustomFieldGroup>): CustomFieldGroup | null {
    const group = this.db.customFieldGroups.get(groupId);
    if (!group) return null;

    const updatedGroup: CustomFieldGroup = {
      ...group,
      ...updates,
      id: group.id // Ensure ID doesn't change
    };

    this.db.customFieldGroups.set(groupId, updatedGroup);
    return updatedGroup;
  }

  getFieldGroups(entityType: CustomFieldEntity): CustomFieldGroup[] {
    return Array.from(this.db.customFieldGroups.values())
      .filter(group => group.entityType === entityType)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  /**
   * Templates Management
   */

  createTemplate(template: Omit<CustomFieldTemplate, 'id'>): CustomFieldTemplate {
    const newTemplate: CustomFieldTemplate = {
      id: `template-${uuidv4()}`,
      ...template
    };

    this.db.customFieldTemplates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  applyTemplate(templateId: string, entityType: CustomFieldEntity): CustomFieldDefinition[] {
    const template = this.db.customFieldTemplates.get(templateId);
    if (!template || template.entityType !== entityType) return [];

    const createdFields: CustomFieldDefinition[] = [];
    template.fields.forEach(fieldDef => {
      const field = this.createFieldDefinition({
        ...fieldDef,
        entityType,
        name: fieldDef.name || 'Unnamed Field'
      } as Omit<CustomFieldDefinition, 'id'>);
      createdFields.push(field);
    });

    return createdFields;
  }

  /**
   * Memo Fields (Simplified Custom Fields)
   */

  createMemoField(name: string, projectId?: string): MemoField {
    // Create field with memo- prefix for ID
    const newField: CustomFieldDefinition = {
      id: `memo-${uuidv4()}`,
      name,
      type: 'text' as CustomFieldType,
      entityType: 'project' as CustomFieldEntity,
      displayOptions: {
        showInTable: true,
        showInDetail: true,
        showInForm: true,
        width: '150px'
      },
      metadata: {
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.db.customFieldDefinitions.set(newField.id, newField);
    return newField as MemoField;
  }

  getMemoFields(): MemoField[] {
    return this.getFieldDefinitionsByEntity('project' as CustomFieldEntity)
      .filter(field => field.id.startsWith('memo-') && (field.type === 'text' || field.type === 'rich_text')) as MemoField[];
  }

  /**
   * Validation
   */

  private validateFieldValue(field: CustomFieldDefinition, value: any): boolean {
    // Required field check
    if (field.required && (value === null || value === undefined || value === '')) {
      return false;
    }

    // Type-specific validation
    switch (field.type) {
      case 'number' as CustomFieldType:
      case 'currency' as CustomFieldType:
      case 'percentage' as CustomFieldType:
        if (value !== null && value !== undefined) {
          const num = Number(value);
          if (isNaN(num)) return false;
          if (field.validation?.min !== undefined && num < field.validation.min) return false;
          if (field.validation?.max !== undefined && num > field.validation.max) return false;
        }
        break;

      case 'text' as CustomFieldType:
      case 'email' as CustomFieldType:
      case 'phone' as CustomFieldType:
      case 'url' as CustomFieldType:
        if (value !== null && value !== undefined) {
          const str = String(value);
          if (field.validation?.minLength !== undefined && str.length < field.validation.minLength) return false;
          if (field.validation?.maxLength !== undefined && str.length > field.validation.maxLength) return false;
          if (field.validation?.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(str)) return false;
          }
        }
        break;

      case 'select' as CustomFieldType:
        if (value !== null && value !== undefined) {
          const validOptions = field.options?.map(opt => opt.value) || [];
          if (!validOptions.includes(value)) return false;
        }
        break;

      case 'multiselect' as CustomFieldType:
      case 'tags' as CustomFieldType:
        if (value !== null && value !== undefined) {
          if (!Array.isArray(value)) return false;
          const validOptions = field.options?.map(opt => opt.value) || [];
          if (field.type === 'multiselect' as CustomFieldType) {
            for (const v of value) {
              if (!validOptions.includes(v)) return false;
            }
          }
        }
        break;

      case 'checkbox' as CustomFieldType:
        if (value !== null && value !== undefined && typeof value !== 'boolean') {
          return false;
        }
        break;

      case 'date' as CustomFieldType:
        if (value !== null && value !== undefined) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
        }
        break;

      case 'rating' as CustomFieldType:
        if (value !== null && value !== undefined) {
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 5) return false;
        }
        break;
    }

    return true;
  }

  /**
   * Bulk Operations
   */

  copyFieldsToEntity(sourceEntityId: string, targetEntityId: string, entityType: CustomFieldEntity): number {
    const sourceValues = this.getFieldValues(sourceEntityId, entityType);
    let copiedCount = 0;

    sourceValues.forEach(value => {
      this.setFieldValue(targetEntityId, entityType, value.fieldId, value.value);
      copiedCount++;
    });

    return copiedCount;
  }

  clearEntityFields(entityId: string, entityType?: CustomFieldEntity): number {
    const values = this.getFieldValues(entityId, entityType);
    values.forEach(value => {
      this.deleteFieldValue(entityId, value.fieldId);
    });
    return values.length;
  }

  /**
   * Export/Import
   */

  exportFieldDefinitions(entityType?: CustomFieldEntity): any {
    const fields = entityType 
      ? this.getFieldDefinitionsByEntity(entityType)
      : Array.from(this.db.customFieldDefinitions.values());
    
    return {
      fields,
      groups: Array.from(this.db.customFieldGroups.values()).filter(g => 
        !entityType || g.entityType === entityType
      ),
      templates: Array.from(this.db.customFieldTemplates.values()).filter(t =>
        !entityType || t.entityType === entityType
      )
    };
  }

  importFieldDefinitions(data: any): void {
    // Import fields
    if (data.fields && Array.isArray(data.fields)) {
      data.fields.forEach((field: CustomFieldDefinition) => {
        this.db.customFieldDefinitions.set(field.id, field);
      });
    }

    // Import groups
    if (data.groups && Array.isArray(data.groups)) {
      data.groups.forEach((group: CustomFieldGroup) => {
        this.db.customFieldGroups.set(group.id, group);
      });
    }

    // Import templates
    if (data.templates && Array.isArray(data.templates)) {
      data.templates.forEach((template: CustomFieldTemplate) => {
        this.db.customFieldTemplates.set(template.id, template);
      });
    }
  }
}