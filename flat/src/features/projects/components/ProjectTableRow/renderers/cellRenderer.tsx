/**
 * Cell renderer mapping for project table rows
 */

import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { UseEditableCellReturn } from '@/hooks/useEditableCell';
import * as cellRenderers from '../cellRenderers';
import { ProjectType, ProjectField, ProjectFactoryField } from '@/types/enums';

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

  // Using ProjectField enum values for consistency
  switch (columnId) {
    case ProjectField.NAME:
      return <cellRenderers.NameCell {...cellRenderProps} />;
      
    case 'productType': // Custom field - not in ProjectField enum
      return <cellRenderers.ProductTypeCell {...cellRenderProps} />;
      
    case ProjectField.SERVICE_TYPE:
      return <cellRenderers.ServiceTypeCell {...cellRenderProps} />;
      
    case 'currentStage': // Custom field - not in ProjectField enum  
      return <cellRenderers.CurrentStageCell {...cellRenderProps} />;
      
    case ProjectField.STATUS:
      return <cellRenderers.StatusCell {...cellRenderProps} />;
      
    case ProjectField.PROGRESS:
      return <cellRenderers.ProgressCell {...cellRenderProps} />;
      
    case 'client': // Custom field (maps to customer)
      return <cellRenderers.ClientCell {...cellRenderProps} />;
      
    case ProjectField.START_DATE:
      return <cellRenderers.StartDateCell {...cellRenderProps} />;
      
    case ProjectField.END_DATE:
      return <cellRenderers.EndDateCell {...cellRenderProps} />;
      
    case ProjectField.MANUFACTURER:
      const manufacturerCellProps = {
        ...cellRenderProps,
        field: ProjectFactoryField.MANUFACTURER,
        isVisible: project.type === ProjectType.SUB
      };
      return manufacturerCellProps.isVisible ? (
        <cellRenderers.FactoryCell {...manufacturerCellProps} />
      ) : null;
      
    case ProjectField.CONTAINER:
      const containerCellProps = {
        ...cellRenderProps,
        field: ProjectFactoryField.CONTAINER,
        isVisible: project.type === ProjectType.SUB
      };
      return containerCellProps.isVisible ? (
        <cellRenderers.FactoryCell {...containerCellProps} />
      ) : null;
      
    case ProjectField.PACKAGING:
      const packagingCellProps = {
        ...cellRenderProps,
        field: ProjectFactoryField.PACKAGING,
        isVisible: project.type === ProjectType.SUB
      };
      return packagingCellProps.isVisible ? (
        <cellRenderers.FactoryCell {...packagingCellProps} />
      ) : null;
      
    case ProjectField.SALES:
      return <cellRenderers.SalesCell {...cellRenderProps} />;
      
    case ProjectField.PURCHASE:
      return <cellRenderers.PurchaseCell {...cellRenderProps} />;
      
    case ProjectField.DEPOSIT_PAID:
      return <cellRenderers.DepositPaidCell {...cellRenderProps} />;
      
    case ProjectField.PRIORITY:
      return <cellRenderers.PriorityCell {...cellRenderProps} />;
      
    default:
      return null;
  }
};