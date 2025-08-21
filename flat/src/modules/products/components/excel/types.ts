export interface ContentRow {
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

export type TableType = 'content' | 'fragrance' | 'material';

export enum DeliveryStatus {
  NONE = '',
  YES = 'O',
  NO = 'X'
}

export enum ColumnWidth {
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

export enum TableColor {
  CONTENT = 'blue',
  FRAGRANCE = 'purple',
  MATERIAL = 'green'
}

// CSS Classes
export const CELL_INPUT_CLASS = 'w-full px-1 py-0.5 border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs';
export const CELL_BORDER_CLASS = 'border border-gray-300 p-0.5';
export const HEADER_CELL_CLASS = 'border border-gray-300 p-1.5 text-center';
export const ADD_BUTTON_CLASS = 'px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition-colors flex items-center gap-1';

export const TABLE_HEADERS = {
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