import React, { useState } from 'react';
import { ContentType, ContentTypeLabel, ContentSubCategoryDefault } from '@/types/enums/content';
import { Plus, Trash2, Copy } from 'lucide-react';

interface ContentRow {
  id: string;
  rowNumber: number; // 차수
  category: string; // 대분류
  subCategory: string; // 중분류
  requestDate: string; // 의뢰일자
  companyName: string; // 업체명
  labNumber: string; // 랩넘버
  factoLabNumber: string; // 팩토랩넘버
  productIngredients: string; // 제품성분
  estimatedDate: string; // 예상일자
  productReceiptDate: string; // 제품수령일자
  customerDelivery: string; // 고객발송여부-택배
  fileAttachment: string; // 파일첨부
}

interface ContentExcelTableProps {
  projectId?: string;
}

export const ContentExcelTable: React.FC<ContentExcelTableProps> = ({ projectId }) => {
  const [contentType, setContentType] = useState<ContentType>(ContentType.N_LEVEL);
  
  // 각 타입별로 데이터 분리 관리
  const [nLevelRows, setNLevelRows] = useState<ContentRow[]>([]);
  const [fragranceRows, setFragranceRows] = useState<ContentRow[]>([]);
  const [materialRows, setMaterialRows] = useState<ContentRow[]>([]);

  // 현재 표시되는 데이터 가져오기
  const getCurrentRows = () => {
    switch (contentType) {
      case ContentType.FRAGRANCE:
        return fragranceRows;
      case ContentType.MATERIAL:
        return materialRows;
      default:
        return nLevelRows;
    }
  };

  // 현재 데이터 설정
  const setCurrentRows = (rows: ContentRow[]) => {
    switch (contentType) {
      case ContentType.FRAGRANCE:
        setFragranceRows(rows);
        break;
      case ContentType.MATERIAL:
        setMaterialRows(rows);
        break;
      default:
        setNLevelRows(rows);
    }
  };

  const contentRows = getCurrentRows();

  const handleCellEdit = (rowId: string, field: string, value: string) => {
    const currentRows = getCurrentRows();
    const updatedRows = currentRows.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    );
    setCurrentRows(updatedRows);
  };

  const addRow = () => {
    const currentRows = getCurrentRows();
    const newRow: ContentRow = {
      id: Date.now().toString(),
      rowNumber: currentRows.length + 1,
      category: '',
      subCategory: ContentSubCategoryDefault[contentType],
      requestDate: new Date().toISOString().split('T')[0],
      companyName: '',
      labNumber: '',
      factoLabNumber: '',
      productIngredients: '',
      estimatedDate: '',
      productReceiptDate: '',
      customerDelivery: '',
      fileAttachment: '',
    };
    
    setCurrentRows([...currentRows, newRow]);
  };

  const deleteRow = (rowId: string) => {
    const currentRows = getCurrentRows();
    const filtered = currentRows.filter(row => row.id !== rowId);
    // 번호 재정렬
    const renumbered = filtered.map((row, index) => ({
      ...row,
      rowNumber: index + 1
    }));
    setCurrentRows(renumbered);
  };

  const duplicateRow = (rowId: string) => {
    const currentRows = getCurrentRows();
    const rowToDuplicate = currentRows.find(row => row.id === rowId);
    if (rowToDuplicate) {
      const newRow = {
        ...rowToDuplicate,
        id: Date.now().toString(),
        rowNumber: currentRows.length + 1,
      };
      setCurrentRows([...currentRows, newRow]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">내용물 상세</h2>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {Object.values(ContentType).map((type) => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={`px-3 py-1 rounded-md transition-colors text-sm font-medium ${
                  contentType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {ContentTypeLabel[type]}
              </button>
            ))}
          </div>
          <button
            onClick={addRow}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            행 추가
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-w-full">
        <table className="w-auto min-w-0 border-collapse text-xs">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-gray-300 p-2 text-center min-w-[50px]">차수</th>
              <th className="border border-gray-300 p-2 text-center min-w-[80px]">대분류</th>
              <th className="border border-gray-300 p-2 text-center min-w-[80px]">중분류</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">의뢰일자</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">업체명</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">랩넘버</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">팩토랩넘버</th>
              <th className="border border-gray-300 p-2 text-center min-w-[120px]">제품성분</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">ETD (예상일자)</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">제품수령일자</th>
              <th className="border border-gray-300 p-2 text-center min-w-[120px]">고객발송여부-택배</th>
              <th className="border border-gray-300 p-2 text-center min-w-[100px]">파일첨부</th>
              <th className="border border-gray-300 bg-gray-100 p-2 text-center min-w-[80px]">작업</th>
            </tr>
          </thead>
          <tbody>
            {contentRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-1 text-center">{row.rowNumber}차</td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.category}
                      onChange={(e) => handleCellEdit(row.id, 'category', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.subCategory}
                      onChange={(e) => handleCellEdit(row.id, 'subCategory', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="date"
                      value={row.requestDate}
                      onChange={(e) => handleCellEdit(row.id, 'requestDate', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.companyName}
                      onChange={(e) => handleCellEdit(row.id, 'companyName', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.labNumber}
                      onChange={(e) => handleCellEdit(row.id, 'labNumber', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.factoLabNumber}
                      onChange={(e) => handleCellEdit(row.id, 'factoLabNumber', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.productIngredients}
                      onChange={(e) => handleCellEdit(row.id, 'productIngredients', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="date"
                      value={row.estimatedDate}
                      onChange={(e) => handleCellEdit(row.id, 'estimatedDate', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="date"
                      value={row.productReceiptDate}
                      onChange={(e) => handleCellEdit(row.id, 'productReceiptDate', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <select
                      value={row.customerDelivery}
                      onChange={(e) => handleCellEdit(row.id, 'customerDelivery', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      <option value="O">O</option>
                      <option value="X">X</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={row.fileAttachment}
                      onChange={(e) => handleCellEdit(row.id, 'fileAttachment', e.target.value)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="파일 선택..."
                    />
                  </td>
                <td className="border border-gray-300 p-1 text-center">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => duplicateRow(row.id)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                      title="복사"
                    >
                      <Copy className="w-3 h-3 text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          총 {contentRows.length}개 항목
        </div>
        <button
          onClick={addRow}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 새 행 추가
        </button>
      </div>
    </div>
  );
};