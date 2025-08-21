/**
 * Factory related enums and constants
 */

// Factory Types
export enum FactoryType {
  FRAGRANCE = 'FRAGRANCE',
  MATERIAL = 'MATERIAL',
  MANUFACTURING = 'MANUFACTURING',
  CONTAINER = 'CONTAINER',
  PACKAGING = 'PACKAGING',
}

// Factory Type Labels (Korean)
export const FactoryTypeLabel: Record<FactoryType, string> = {
  [FactoryType.FRAGRANCE]: '향',
  [FactoryType.MATERIAL]: '원료',
  [FactoryType.MANUFACTURING]: '내용물',
  [FactoryType.CONTAINER]: '용기',
  [FactoryType.PACKAGING]: '포장',
};

// Project Factory Fields
export enum ProjectFactoryField {
  FRAGRANCE = 'fragrance',
  MATERIAL = 'material',
  MANUFACTURER = 'manufacturer',
  CONTAINER = 'container',
  PACKAGING = 'packaging',
}

// Project Factory ID Fields
export enum ProjectFactoryIdField {
  FRAGRANCE_ID = 'fragranceId',
  MATERIAL_ID = 'materialId',
  MANUFACTURER_ID = 'manufacturerId',
  CONTAINER_ID = 'containerId',
  PACKAGING_ID = 'packagingId',
}

// Factory Field to Type Mapping
export const FactoryFieldToType: Record<ProjectFactoryField, FactoryType> = {
  [ProjectFactoryField.FRAGRANCE]: FactoryType.FRAGRANCE,
  [ProjectFactoryField.MATERIAL]: FactoryType.MATERIAL,
  [ProjectFactoryField.MANUFACTURER]: FactoryType.MANUFACTURING,
  [ProjectFactoryField.CONTAINER]: FactoryType.CONTAINER,
  [ProjectFactoryField.PACKAGING]: FactoryType.PACKAGING,
};

// Factory Type to Field Mapping
export const FactoryTypeToField: Record<FactoryType, ProjectFactoryField> = {
  [FactoryType.FRAGRANCE]: ProjectFactoryField.FRAGRANCE,
  [FactoryType.MATERIAL]: ProjectFactoryField.MATERIAL,
  [FactoryType.MANUFACTURING]: ProjectFactoryField.MANUFACTURER,
  [FactoryType.CONTAINER]: ProjectFactoryField.CONTAINER,
  [FactoryType.PACKAGING]: ProjectFactoryField.PACKAGING,
};

// Factory Type to ID Field Mapping
export const FactoryTypeToIdField: Record<FactoryType, ProjectFactoryIdField> = {
  [FactoryType.FRAGRANCE]: ProjectFactoryIdField.FRAGRANCE_ID,
  [FactoryType.MATERIAL]: ProjectFactoryIdField.MATERIAL_ID,
  [FactoryType.MANUFACTURING]: ProjectFactoryIdField.MANUFACTURER_ID,
  [FactoryType.CONTAINER]: ProjectFactoryIdField.CONTAINER_ID,
  [FactoryType.PACKAGING]: ProjectFactoryIdField.PACKAGING_ID,
};

// Factory Assignment Roles
export enum FactoryAssignmentRole {
  PRIMARY = 'primary',
  SAMPLE = 'sample',
  BACKUP = 'backup',
  PRODUCTION = 'production',
  TEST = 'test',
}