/**
 * Cell renderer mapping for project table rows
 */

import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { UseEditableCellReturn } from '@/hooks/useEditableCell';
import * as cellRenderers from '../cellRenderers';
import { ProjectType, ProjectFactoryField } from '@/types/enums';

interface CellRenderProps {
  project: Project;
  editableCell: UseEditableCellReturn;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  index?: number;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
}

export const renderTableCell = (columnId: string, props: CellRenderProps) => {
  const { project, editableCell, onUpdateField, index, isDragging, onStartDrag } = props;

  const cellRenderProps = { 
    project, 
    editableCell, 
    onUpdateField,
    index,
    isDragging,
    onStartDrag 
  };

  switch (columnId) {
    case 'name':
      return <cellRenderers.NameCell {...cellRenderProps} />;
      
    case 'productType':
      return <cellRenderers.ProductTypeCell {...cellRenderProps} />;
      
    case 'serviceType':
      return <cellRenderers.ServiceTypeCell {...cellRenderProps} />;
      
    case 'currentStage':
      return <cellRenderers.CurrentStageCell {...cellRenderProps} />;
      
    case 'status':
      return <cellRenderers.StatusCell {...cellRenderProps} />;
      
    case 'progress':
      return <cellRenderers.ProgressCell {...cellRenderProps} />;
      
    case 'client':
      return <cellRenderers.ClientCell {...cellRenderProps} />;
      
    case 'startDate':
      return <cellRenderers.StartDateCell {...cellRenderProps} />;
      
    case 'endDate':
      return <cellRenderers.EndDateCell {...cellRenderProps} />;
      
    case 'manufacturer':
      const manufacturerCellProps = {
        ...cellRenderProps,
        factoryField: ProjectFactoryField.MANUFACTURER_ID,
        isVisible: project.type === ProjectType.SUB
      };
      return manufacturerCellProps.isVisible ? (
        <cellRenderers.FactoryCell {...manufacturerCellProps} />
      ) : null;
      
    case 'container':
      const containerCellProps = {
        ...cellRenderProps,
        factoryField: ProjectFactoryField.CONTAINER_ID,
        isVisible: project.type === ProjectType.SUB
      };
      return containerCellProps.isVisible ? (
        <cellRenderers.FactoryCell {...containerCellProps} />
      ) : null;
      
    case 'packaging':
      const packagingCellProps = {
        ...cellRenderProps,
        factoryField: ProjectFactoryField.PACKAGING_ID,
        isVisible: project.type === ProjectType.SUB
      };
      return packagingCellProps.isVisible ? (
        <cellRenderers.FactoryCell {...packagingCellProps} />
      ) : null;
      
    case 'sales':
      return <cellRenderers.SalesCell {...cellRenderProps} />;
      
    case 'purchase':
      return <cellRenderers.PurchaseCell {...cellRenderProps} />;
      
    case 'depositPaid':
      return <cellRenderers.DepositPaidCell {...cellRenderProps} />;
      
    case 'priority':
      return <cellRenderers.PriorityCell {...cellRenderProps} />;
      
    default:
      return null;
  }
};