// Re-export all cell renderers
export * from './cellRenderers/basicCells';
export * from './cellRenderers/dropdownCells';
export * from './cellRenderers/FactoryCell';
export * from './cellRenderers/CurrentStageCell';
export * from './cellRenderers/DepositPaidCell';

// Export convenience function for factory rendering
export { FactoryCell } from './cellRenderers/FactoryCell';

export const renderFactory = (
  field: 'manufacturer' | 'container' | 'packaging', 
  props: any
) => <FactoryCell field={field} {...props} />;