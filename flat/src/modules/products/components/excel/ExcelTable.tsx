import React from 'react';
import { Plus } from 'lucide-react';
import { ExcelTableRow } from './ExcelTableRow';
import { 
  ContentRow, 
  TableType, 
  ColumnWidth, 
  HEADER_CELL_CLASS, 
  ADD_BUTTON_CLASS,
  TABLE_HEADERS 
} from './types';

interface ExcelTableProps {
  tableType: TableType;
  title: string;
  isOptional: boolean;
  color: string;
  rows: ContentRow[];
  availableProductTypes: string[];
  availableFactories: any[];
  onCellEdit: (rowId: string, field: string, value: string | number, tableType: TableType) => void;
  onFactoryChange: (rowId: string, factoryIds: string[], tableType: TableType) => void;
  onAddRow: (tableType: TableType) => void;
  onDuplicateRow: (rowId: string, tableType: TableType) => void;
  onDeleteRow: (rowId: string, tableType: TableType) => void;
}

export const ExcelTable: React.FC<ExcelTableProps> = ({
  tableType,
  title,
  isOptional,
  color,
  rows,
  availableProductTypes,
  availableFactories,
  onCellEdit,
  onFactoryChange,
  onAddRow,
  onDuplicateRow,
  onDeleteRow
}) => {
  const headers = TABLE_HEADERS[tableType];

  return (
    <div className="mb-6">
      <div className="mb-2">
        <h3 className="text-base font-bold text-gray-800">
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: ColumnWidth.ROW_NUMBER }} />
            <col style={{ width: ColumnWidth.PRODUCT_TYPE }} />
            <col style={{ width: ColumnWidth.REQUEST_DATE }} />
            <col style={{ width: ColumnWidth.COMPANY_NAME }} />
            <col style={{ width: ColumnWidth.CODE }} />
            <col style={{ width: ColumnWidth.NAME }} />
            <col style={{ width: ColumnWidth.DETAIL }} />
            <col style={{ width: ColumnWidth.ETD }} />
            <col style={{ width: ColumnWidth.RECEIPT_DATE }} />
            <col style={{ width: ColumnWidth.DELIVERY }} />
            <col style={{ width: ColumnWidth.ATTACHMENT }} />
            <col style={{ width: ColumnWidth.ACTIONS }} />
          </colgroup>
          <thead>
            <tr className={`bg-${color}-100`}>
              <th className={HEADER_CELL_CLASS}>차수</th>
              <th className={HEADER_CELL_CLASS}>제품유형</th>
              <th className={HEADER_CELL_CLASS}>의뢰일자</th>
              <th className={HEADER_CELL_CLASS}>{headers.company}</th>
              <th className={HEADER_CELL_CLASS}>{headers.code}</th>
              <th className={HEADER_CELL_CLASS}>{headers.name}</th>
              <th className={HEADER_CELL_CLASS}>{headers.detail}</th>
              <th className={HEADER_CELL_CLASS}>ETD</th>
              <th className={HEADER_CELL_CLASS}>{headers.receipt}</th>
              <th className={HEADER_CELL_CLASS}>고객발송</th>
              <th className={HEADER_CELL_CLASS}>파일첨부</th>
              <th className={`${HEADER_CELL_CLASS} bg-gray-100`}>작업</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="border border-gray-300 p-8 text-center text-gray-400">
                  {isOptional ? '선택사항 - 필요시 행을 추가하세요' : '행을 추가하여 데이터를 입력하세요'}
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <ExcelTableRow
                  key={row.id}
                  row={row}
                  tableType={tableType}
                  availableProductTypes={availableProductTypes}
                  availableFactories={availableFactories}
                  onCellEdit={onCellEdit}
                  onFactoryChange={onFactoryChange}
                  onDuplicate={onDuplicateRow}
                  onDelete={onDeleteRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 flex justify-start">
        <button
          onClick={() => onAddRow(tableType)}
          className={ADD_BUTTON_CLASS}
        >
          <Plus className="w-3 h-3" />
          행 추가
        </button>
      </div>
    </div>
  );
};