import React, { useState } from 'react';
import '../styles/form-styles.css';

interface ContentsSectionProps {
  data: {
    requiredIngredients?: string[];
    optionalIngredients?: string[];
    excludedIngredients?: string[];
  };
  onChange: (field: string, value: any) => void;
}

export const ContentsSection: React.FC<ContentsSectionProps> = ({ data, onChange }) => {
  const addIngredient = (field: 'requiredIngredients' | 'optionalIngredients' | 'excludedIngredients') => {
    const currentList = data[field] || [];
    onChange(field, [...currentList, '']);
  };

  const removeIngredient = (field: 'requiredIngredients' | 'optionalIngredients' | 'excludedIngredients', index: number) => {
    const currentList = data[field] || [];
    const updatedList = currentList.filter((_, i) => i !== index);
    onChange(field, updatedList);
  };

  const updateIngredient = (field: 'requiredIngredients' | 'optionalIngredients' | 'excludedIngredients', index: number, value: string) => {
    const currentList = data[field] || [];
    const updatedList = [...currentList];
    updatedList[index] = value;
    onChange(field, updatedList);
  };

  const renderIngredientList = (
    field: 'requiredIngredients' | 'optionalIngredients' | 'excludedIngredients',
    title: string,
    placeholder: string
  ) => {
    const list = data[field] || [];
    
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label">{title}</label>
          <button
            type="button"
            onClick={() => addIngredient(field)}
            className="form-button-add text-sm px-3 py-1"
          >
            + 성분 추가
          </button>
        </div>
        
        <div className="space-y-2">
          {list.length === 0 ? (
            <div className="text-gray-500 text-sm p-3 border border-dashed border-gray-300 rounded-lg text-center">
              아직 등록된 성분이 없습니다. "성분 추가" 버튼을 눌러 성분을 추가하세요.
            </div>
          ) : (
            list.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(field, index, e.target.value)}
                  placeholder={placeholder}
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(field, index)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 text-sm font-medium"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="form-section">
      <div className="mb-6">
        <h3 className="form-section-title mb-0">내용물 상세</h3>
      </div>
      
      <div className="space-y-6">
        {/* 필수 요청 성분 */}
        {renderIngredientList('requiredIngredients', '필수 요청 성분', '필수로 포함되어야 하는 성분을 입력하세요')}
        
        {/* 요청성분 (공장 미보유시 제외 가능) */}
        {renderIngredientList('optionalIngredients', '요청성분 (공장 미보유시 제외 가능)', '포함되길 원하는 성분을 입력하세요')}
        
        {/* 필수 배제 성분 */}
        {renderIngredientList('excludedIngredients', '필수 배제 성분', '반드시 제외되어야 하는 성분을 입력하세요')}
      </div>
    </div>
  );
};