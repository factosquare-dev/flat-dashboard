/**
 * Factory related enums and constants
 */

// Factory Types
export enum FactoryType {
  MANUFACTURING = 'MANUFACTURING',
  CONTAINER = 'CONTAINER',
  PACKAGING = 'PACKAGING',
}

// Factory Type Labels (Korean)
export const FactoryTypeLabel: Record<FactoryType, string> = {
  [FactoryType.MANUFACTURING]: '제조',
  [FactoryType.CONTAINER]: '용기',
  [FactoryType.PACKAGING]: '포장',
};

// Project Factory Fields
export enum ProjectFactoryField {
  MANUFACTURER = 'manufacturer',
  CONTAINER = 'container',
  PACKAGING = 'packaging',
}

// Project Factory ID Fields
export enum ProjectFactoryIdField {
  MANUFACTURER_ID = 'manufacturerId',
  CONTAINER_ID = 'containerId',
  PACKAGING_ID = 'packagingId',
}

// Factory Field to Type Mapping
export const FactoryFieldToType: Record<ProjectFactoryField, FactoryType> = {
  [ProjectFactoryField.MANUFACTURER]: FactoryType.MANUFACTURING,
  [ProjectFactoryField.CONTAINER]: FactoryType.CONTAINER,
  [ProjectFactoryField.PACKAGING]: FactoryType.PACKAGING,
};

// Factory Type to Field Mapping
export const FactoryTypeToField: Record<FactoryType, ProjectFactoryField> = {
  [FactoryType.MANUFACTURING]: ProjectFactoryField.MANUFACTURER,
  [FactoryType.CONTAINER]: ProjectFactoryField.CONTAINER,
  [FactoryType.PACKAGING]: ProjectFactoryField.PACKAGING,
};

// Factory Type to ID Field Mapping
export const FactoryTypeToIdField: Record<FactoryType, ProjectFactoryIdField> = {
  [FactoryType.MANUFACTURING]: ProjectFactoryIdField.MANUFACTURER_ID,
  [FactoryType.CONTAINER]: ProjectFactoryIdField.CONTAINER_ID,
  [FactoryType.PACKAGING]: ProjectFactoryIdField.PACKAGING_ID,
};