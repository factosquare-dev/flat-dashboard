import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { MOCK_COMPANY_NAMES } from '@/constants';

// 고객사 목록 - Mock DB에서 가져오기
const getAllClients = (): string[] => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const customers = Array.from(database.customers.values());
    return customers.length > 0 
      ? customers.map(customer => customer.name)
      : [...MOCK_COMPANY_NAMES];
  } catch (error) {
    console.warn('[MockData] Failed to load customers from MockDB, using fallback data');
    return [...MOCK_COMPANY_NAMES];
  }
};

export const allClients = getAllClients();