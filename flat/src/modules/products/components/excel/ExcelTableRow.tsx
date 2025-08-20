import React from 'react';
import { DatePickerCell } from './DatePickerCell';
import { ActionButtons } from './ActionButtons';
import { 
  ContentRow, 
  TableType, 
  DeliveryStatus, 
  CELL_INPUT_CLASS, 
  CELL_BORDER_CLASS 
} from './types';

interface ExcelTableRowProps {
  row: ContentRow;
  tableType: TableType;
  availableProductTypes: string[];
  availableFactories: any[];
  onCellEdit: (rowId: string, field: string, value: string | number, tableType: TableType) => void;
  onFactoryChange: (rowId: string, factoryIds: string[], tableType: TableType) => void;
  onDuplicate: (rowId: string, tableType: TableType) => void;
  onDelete: (rowId: string, tableType: TableType) => void;
}

export const ExcelTableRow: React.FC<ExcelTableRowProps> = ({
  row,
  tableType,
  availableProductTypes,
  availableFactories,
  onCellEdit,
  onFactoryChange,
  onDuplicate,
  onDelete
}) => (
  <tr className="hover:bg-gray-50">
    <td className={CELL_BORDER_CLASS}>
      <input
        type="number"
        value={row.rowNumber}
        onChange={(e) => onCellEdit(row.id, 'rowNumber', e.target.value, tableType)}
        className={`${CELL_INPUT_CLASS} text-center`}
        min="1"
      />
    </td>
    <td className={CELL_BORDER_CLASS}>
      <select
        value={row.productType}
        onChange={(e) => onCellEdit(row.id, 'productType', e.target.value, tableType)}
        className={CELL_INPUT_CLASS}
      >
        <option value="">선택...</option>
        {availableProductTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </td>
    <td className="border border-gray-300 p-0">
      <DatePickerCell
        value={row.requestDate}
        onChange={(value) => onCellEdit(row.id, 'requestDate', value, tableType)}
      />
    </td>
    <td className={CELL_BORDER_CLASS}>
      <select
        value={row.selectedFactories?.[0] || ''}
        onChange={(e) => {
          const factory = availableFactories.find(f => f.id === e.target.value);
          onCellEdit(row.id, 'companyName', factory?.name || '', tableType);
          onFactoryChange(row.id, e.target.value ? [e.target.value] : [], tableType);
        }}
        className={CELL_INPUT_CLASS}
      >
        <option value="">선택...</option>
        {availableFactories.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
    </td>
    <td className={CELL_BORDER_CLASS}>
      <input
        type="text"
        value={row.labNumber}
        onChange={(e) => onCellEdit(row.id, 'labNumber', e.target.value, tableType)}
        className={CELL_INPUT_CLASS}
      />
    </td>
    <td className={CELL_BORDER_CLASS}>
      <input
        type="text"
        value={row.factoLabNumber}
        onChange={(e) => onCellEdit(row.id, 'factoLabNumber', e.target.value, tableType)}
        className={CELL_INPUT_CLASS}
      />
    </td>
    <td className={CELL_BORDER_CLASS}>
      <input
        type="text"
        value={row.productIngredients}
        onChange={(e) => onCellEdit(row.id, 'productIngredients', e.target.value, tableType)}
        className={CELL_INPUT_CLASS}
      />
    </td>
    <td className="border border-gray-300 p-0">
      <DatePickerCell
        value={row.estimatedDate}
        onChange={(value) => onCellEdit(row.id, 'estimatedDate', value, tableType)}
      />
    </td>
    <td className="border border-gray-300 p-0">
      <DatePickerCell
        value={row.productReceiptDate}
        onChange={(value) => onCellEdit(row.id, 'productReceiptDate', value, tableType)}
      />
    </td>
    <td className={CELL_BORDER_CLASS}>
      <select
        value={row.customerDelivery}
        onChange={(e) => onCellEdit(row.id, 'customerDelivery', e.target.value, tableType)}
        className={CELL_INPUT_CLASS}
      >
        <option value={DeliveryStatus.NONE}>-</option>
        <option value={DeliveryStatus.YES}>O</option>
        <option value={DeliveryStatus.NO}>X</option>
      </select>
    </td>
    <td className={CELL_BORDER_CLASS}>
      <input
        type="text"
        value={row.fileAttachment}
        onChange={(e) => onCellEdit(row.id, 'fileAttachment', e.target.value, tableType)}
        className={CELL_INPUT_CLASS}
        placeholder="파일..."
      />
    </td>
    <td className={`${CELL_BORDER_CLASS} text-center`}>
      <ActionButtons
        onDuplicate={() => onDuplicate(row.id, tableType)}
        onDelete={() => onDelete(row.id, tableType)}
      />
    </td>
  </tr>
);