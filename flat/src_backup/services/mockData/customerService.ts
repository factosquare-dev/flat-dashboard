/**
 * Customer Data Service
 * Wrapper for Customer service operations with synchronous interface
 */

import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { Customer } from '@/types/customer';

export class CustomerDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  /**
   * Get all customers synchronously (for hooks)
   */
  getAllCustomers(): Customer[] {
    try {
      // Use internal database data directly for synchronous access
      const db = (this.db as any).db;
      const customersMap = db?.customers;
      
      if (!customersMap) {
        return [];
      }
      
      // Convert Map to Array
      if (customersMap instanceof Map) {
        return Array.from(customersMap.values());
      }
      
      // Fallback if it's already an array
      return Array.isArray(customersMap) ? customersMap : [];
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return [];
    }
  }

  /**
   * Search customers by name
   */
  searchCustomers(searchTerm: string): Customer[] {
    try {
      const customers = this.getAllCustomers();
      const searchLower = searchTerm.toLowerCase();
      
      return customers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.contactPerson.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Failed to search customers:', error);
      return [];
    }
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Customer | null {
    try {
      const customers = this.getAllCustomers();
      return customers.find(customer => customer.id === id) || null;
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      return null;
    }
  }

  /**
   * Get active customers only
   */
  getActiveCustomers(): Customer[] {
    try {
      const customers = this.getAllCustomers();
      return customers.filter(customer => customer.isActive);
    } catch (error) {
      console.error('Failed to fetch active customers:', error);
      return [];
    }
  }
}