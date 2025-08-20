import React, { useState, useEffect, useMemo } from 'react';
import { ContentType, ContentTypeLabel, ContentSubCategoryDefault } from '@/shared/types/enums/content';
import { Plus, Trash2, Copy } from 'lucide-react';
import { mockDataService } from '@/core/services/mockDataService';
import { ProjectType, ProductType } from '@/shared/types/enums';
import { getProductTypeLabel } from '@/shared/utils/productTypeUtils';
import { formatDate } from '@/shared/utils/date/formatting';

interface ContentRow {
  id: string;
  rowNumber: number; // 차수
  productType: string; // 제품유형
  requestDate: string; // 의뢰일자
  companyName: string; // 공장명/향료사/원료사
  labNumber: string; // 랩넘버/향코드/원료코드
  factoLabNumber: string; // 팩토랩넘버/향명/원료명
  productIngredients: string; // 제품성분/향특징/원료특성
  estimatedDate: string; // 예상일자
  productReceiptDate: string; // 제품수령일자
  customerDelivery: string; // 고객발송여부-택배
  fileAttachment: string; // 파일첨부
  selectedFactories: string[]; // 선택된 공장들
}

interface ContentExcelTableProps {
  projectId?: string;
}

type TableType = 'content' | 'fragrance' | 'material';

// Enums
enum DeliveryStatus {
  NONE = '',
  YES = 'O',
  NO = 'X'
}

enum ColumnWidth {
  ROW_NUMBER = '60px',
  PRODUCT_TYPE = '100px',
  REQUEST_DATE = '100px',
  COMPANY_NAME = '140px',
  CODE = '100px',
  NAME = '100px',
  DETAIL = '120px',
  ETD = '100px',
  RECEIPT_DATE = '100px',
  DELIVERY = '80px',
  ATTACHMENT = '100px',
  ACTIONS = '80px'
}

enum TableColor {
  CONTENT = 'blue',
  FRAGRANCE = 'purple',
  MATERIAL = 'green'
}

// CSS Classes as constants
const CELL_INPUT_CLASS = 'w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs';
const CELL_BORDER_CLASS = 'border border-gray-300 p-0.5';
const HEADER_CELL_CLASS = 'border border-gray-300 p-1.5 text-center';
const ADD_BUTTON_CLASS = 'px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition-colors flex items-center gap-1';

// Date picker cell component
const DatePickerCell: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "날짜 선택" }) => (
  <div className="relative">
    <input
      type="text"
      value={value ? formatDate(value, 'yy-MM-dd') : ''}
      readOnly
      className="w-full px-1 py-0.5 border-0 bg-transparent text-xs cursor-pointer"
      onClick={(e) => {
        const input = e.currentTarget.nextElementSibling as HTMLInputElement;
        input?.showPicker?.();
      }}
      placeholder={placeholder}
    />
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 opacity-0 cursor-pointer"
    />
  </div>
);

// Action buttons component
const ActionButtons: React.FC<{
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({ onDuplicate, onDelete }) => (
  <div className="flex justify-center gap-0.5">
    <button
      onClick={onDuplicate}
      className="p-0.5 hover:bg-blue-100 rounded transition-colors"
      title="복사"
    >
      <Copy className="w-3 h-3 text-blue-600" />
    </button>
    <button
      onClick={onDelete}
      className="p-0.5 hover:bg-red-100 rounded transition-colors"
      title="삭제"
    >
      <Trash2 className="w-3 h-3 text-red-600" />
    </button>
  </div>
);

// Helper function to create new row
const createNewRow = (id: string, rowNumber: number = 1, productType: string = ''): ContentRow => ({
  id,
  rowNumber,
  productType,
  requestDate: new Date().toISOString().split('T')[0],
  companyName: '',
  labNumber: '',
  factoLabNumber: '',
  productIngredients: '',
  estimatedDate: '',
  productReceiptDate: '',
  customerDelivery: '',
  fileAttachment: '',
  selectedFactories: [],
});

// Helper function to calculate product type with numbering
const calculateProductType = (
  project: any,
  subProjects: any[],
  typeCountMap: Map<string, number>
): string => {
  const baseProductType = getProductTypeLabel(
    project?.productType || project?.product?.productType || '제품'
  );
  
  const currentCount = typeCountMap.get(baseProductType) || 0;
  typeCountMap.set(baseProductType, currentCount + 1);
  
  const sameTypeCount = subProjects.filter(p => 
    getProductTypeLabel(p.productType || p.product?.productType) === baseProductType
  ).length;
  
  return sameTypeCount === 1
    ? baseProductType
    : `${baseProductType} ${currentCount + 1}`;
};

export const ContentExcelTable: React.FC<ContentExcelTableProps> = ({ projectId }) => {
  const [availableProductTypes, setAvailableProductTypes] = useState<string[]>([]);
  
  // 각 타입별로 데이터 분리 관리
  const [contentRows, setContentRows] = useState<ContentRow[]>([]);
  const [fragranceRows, setFragranceRows] = useState<ContentRow[]>([]);
  const [materialRows, setMaterialRows] = useState<ContentRow[]>([]);

  // 공장 목록 가져오기
  const availableFactories = useMemo(() => mockDataService.getAllFactories(), []);

  // 프로젝트에서 제품 개수 가져오기 및 자동 행 생성
  useEffect(() => {
    if (!projectId || contentRows.length > 0) return;

    const allProjects = mockDataService.getAllProjects();
    const subProjects = allProjects.filter(
      (p) => p.parentId === projectId && p.type === ProjectType.SUB
    );
    
    if (subProjects.length === 0) return;

    // 사용 가능한 제품유형 목록 설정 및 자동 행 생성
    const productTypes: string[] = [];
    const autoGeneratedRows: ContentRow[] = [];
    const typeMap = new Map<string, number>();
    
    subProjects.forEach((project, index) => {
      const productType = calculateProductType(project, subProjects, typeMap);
      productTypes.push(productType);
      
      const newRow = createNewRow(
        `auto_${index + 1}_${Date.now()}`,
        1,
        productType
      );
      autoGeneratedRows.push(newRow);
    });
    
    setAvailableProductTypes(productTypes);
    setContentRows(autoGeneratedRows);
  }, [projectId, contentRows.length]);

  // Get rows by table type
  const getRowsByType = (tableType: TableType): ContentRow[] => {
    switch (tableType) {
      case 'content': return contentRows;
      case 'fragrance': return fragranceRows;
      case 'material': return materialRows;
    }
  };

  // Set rows by table type
  const setRowsByType = (tableType: TableType, rows: ContentRow[]) => {
    switch (tableType) {
      case 'content': setContentRows(rows); break;
      case 'fragrance': setFragranceRows(rows); break;
      case 'material': setMaterialRows(rows); break;
    }
  };

  // Handle cell edit
  const handleCellEdit = (rowId: string, field: string, value: string | number, tableType: TableType) => {
    const rows = getRowsByType(tableType);
    const updatedRows = rows.map(row => 
      row.id === rowId 
        ? { ...row, [field]: field === 'rowNumber' ? parseInt(value as string) || 1 : value }
        : row
    );
    setRowsByType(tableType, updatedRows);
  };

  // Handle factory change
  const handleFactoryChange = (rowId: string, factoryIds: string[], tableType: TableType) => {
    const rows = getRowsByType(tableType);
    const updatedRows = rows.map(row => 
      row.id === rowId ? { ...row, selectedFactories: factoryIds } : row
    );
    setRowsByType(tableType, updatedRows);
  };

  // Add new row
  const addRow = (tableType: TableType) => {
    const newRow = createNewRow(`${tableType}_${Date.now()}`);
    const rows = getRowsByType(tableType);
    setRowsByType(tableType, [...rows, newRow]);
  };

  // Delete row
  const deleteRow = (rowId: string, tableType: TableType) => {
    const rows = getRowsByType(tableType);
    setRowsByType(tableType, rows.filter(row => row.id !== rowId));
  };

  // Duplicate row
  const duplicateRow = (rowId: string, tableType: TableType) => {
    const rows = getRowsByType(tableType);
    const rowToDuplicate = rows.find(row => row.id === rowId);
    
    if (!rowToDuplicate) return;
    
    const newRow = {
      ...rowToDuplicate,
      id: `dup_${Date.now()}_${Math.random()}`,
    };
    
    const rowIndex = rows.findIndex(row => row.id === rowId);
    const updatedRows = [
      ...rows.slice(0, rowIndex + 1),
      newRow,
      ...rows.slice(rowIndex + 1)
    ];
    
    setRowsByType(tableType, updatedRows);
  };

  // Render table row
  const renderTableRow = (row: ContentRow, tableType: TableType, headers: any) => (
    <tr key={row.id} className="hover:bg-gray-50">
      <td className={CELL_BORDER_CLASS}>
        <input
          type="number"
          value={row.rowNumber}
          onChange={(e) => handleCellEdit(row.id, 'rowNumber', e.target.value, tableType)}
          className={`${CELL_INPUT_CLASS} text-center`}
          min="1"
        />
      </td>
      <td className={CELL_BORDER_CLASS}>
        <select
          value={row.productType}
          onChange={(e) => handleCellEdit(row.id, 'productType', e.target.value, tableType)}
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
          onChange={(value) => handleCellEdit(row.id, 'requestDate', value, tableType)}
        />
      </td>
      <td className={CELL_BORDER_CLASS}>
        <select
          value={row.selectedFactories?.[0] || ''}
          onChange={(e) => {
            const factory = availableFactories.find(f => f.id === e.target.value);
            handleCellEdit(row.id, 'companyName', factory?.name || '', tableType);
            handleFactoryChange(row.id, e.target.value ? [e.target.value] : [], tableType);
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
          onChange={(e) => handleCellEdit(row.id, 'labNumber', e.target.value, tableType)}
          className={CELL_INPUT_CLASS}
        />
      </td>
      <td className={CELL_BORDER_CLASS}>
        <input
          type="text"
          value={row.factoLabNumber}
          onChange={(e) => handleCellEdit(row.id, 'factoLabNumber', e.target.value, tableType)}
          className={CELL_INPUT_CLASS}
        />
      </td>
      <td className={CELL_BORDER_CLASS}>
        <input
          type="text"
          value={row.productIngredients}
          onChange={(e) => handleCellEdit(row.id, 'productIngredients', e.target.value, tableType)}
          className={CELL_INPUT_CLASS}
        />
      </td>
      <td className="border border-gray-300 p-0">
        <DatePickerCell
          value={row.estimatedDate}
          onChange={(value) => handleCellEdit(row.id, 'estimatedDate', value, tableType)}
        />
      </td>
      <td className="border border-gray-300 p-0">
        <DatePickerCell
          value={row.productReceiptDate}
          onChange={(value) => handleCellEdit(row.id, 'productReceiptDate', value, tableType)}
        />
      </td>
      <td className={CELL_BORDER_CLASS}>
        <select
          value={row.customerDelivery}
          onChange={(e) => handleCellEdit(row.id, 'customerDelivery', e.target.value, tableType)}
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
          onChange={(e) => handleCellEdit(row.id, 'fileAttachment', e.target.value, tableType)}
          className={CELL_INPUT_CLASS}
          placeholder="파일..."
        />
      </td>
      <td className={`${CELL_BORDER_CLASS} text-center`}>
        <ActionButtons
          onDuplicate={() => duplicateRow(row.id, tableType)}
          onDelete={() => deleteRow(row.id, tableType)}
        />
      </td>
    </tr>
  );

  // 테이블 렌더링 함수
  const renderTable = (
    tableType: TableType,
    title: string,
    isOptional: boolean = false,
    color: string = 'blue'
  ) => {
    const rows = getRowsByType(tableType);
    
    const headers = {
      content: {
        company: '공장명',
        code: '랩넘버',
        name: '팩토랩넘버',
        detail: '제품성분',
        receipt: '제품수령일자'
      },
      fragrance: {
        company: '향료사',
        code: '향코드',
        name: '향명',
        detail: '향특징',
        receipt: '향수령일자'
      },
      material: {
        company: '원료사',
        code: '원료코드',
        name: '원료명',
        detail: '원료특성',
        receipt: '원료수령일자'
      }
    };

    const h = headers[tableType];

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
                <th className={HEADER_CELL_CLASS}>{h.company}</th>
                <th className={HEADER_CELL_CLASS}>{h.code}</th>
                <th className={HEADER_CELL_CLASS}>{h.name}</th>
                <th className={HEADER_CELL_CLASS}>{h.detail}</th>
                <th className={HEADER_CELL_CLASS}>ETD</th>
                <th className={HEADER_CELL_CLASS}>{h.receipt}</th>
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
                rows.map(row => renderTableRow(row, tableType, h))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 행 추가 버튼을 왼쪽에 배치 */}
        <div className="mt-2 flex justify-start">
          <button
            onClick={() => addRow(tableType)}
            className={ADD_BUTTON_CLASS}
          >
            <Plus className="w-3 h-3" />
            행 추가
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">내용물 상세</h2>
      
      {/* 내용물 테이블 (필수) */}
      {renderTable('content', '내용물', false, TableColor.CONTENT)}
      
      {/* 향 테이블 (선택) */}
      {renderTable('fragrance', '향', true, TableColor.FRAGRANCE)}
      
      {/* 원료 테이블 (선택) */}
      {renderTable('material', '원료', true, TableColor.MATERIAL)}
    </div>
  );
};