/**
 * Customer Service
 * Handles customer-related operations
 */

import { BaseService } from './BaseService';
import { Customer, CreateCustomerInput, UpdateCustomerInput } from '@/types/customer';
import { DbResponse } from '@/mocks/database/types';
import { Project } from '@/types/project';

export interface CustomerWithStats extends Customer {
  totalProjects?: number;
  activeProjects?: number;
  totalRevenue?: number;
}

export class CustomerService extends BaseService<Customer> {
  constructor() {
    super('customers');
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerInput, createdBy: string): Promise<DbResponse<Customer>> {
    const customerData = {
      ...data,
      companyName: data.companyName || data.name, // Use name as company name if not provided
      isActive: true,
      createdBy,
    };

    return super.create(customerData);
  }

  /**
   * Get customer with statistics
   */
  async getByIdWithStats(customerId: string): Promise<DbResponse<CustomerWithStats>> {
    const customerResult = await this.getById(customerId);
    if (!customerResult.success || !customerResult.data) {
      return customerResult;
    }

    const customer = customerResult.data;
    const stats = await this.getCustomerStatistics(customerId);

    return {
      success: true,
      data: {
        ...customer,
        ...stats.data,
      },
    };
  }

  /**
   * Get customer statistics
   */
  private async getCustomerStatistics(customerId: string): Promise<DbResponse<{
    totalProjects: number;
    activeProjects: number;
    totalRevenue: number;
  }>> {
    try {
      const projectsResult = await this.db.getAll('projects');
      if (!projectsResult.success || !projectsResult.data) {
        return {
          success: false,
          error: projectsResult.error || 'Failed to fetch projects',
        };
      }

      const customerProjects = projectsResult.data.filter(
        (project: Project) => project.customer.id === customerId
      );

      const activeProjects = customerProjects.filter(
        (project: Project) => project.status === 'IN_PROGRESS' || project.status === 'PLANNING'
      );

      const totalRevenue = customerProjects.reduce(
        (sum, project: Project) => sum + (project.totalAmount || 0),
        0
      );

      return {
        success: true,
        data: {
          totalProjects: customerProjects.length,
          activeProjects: activeProjects.length,
          totalRevenue,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate statistics',
      };
    }
  }

  /**
   * Search customers by name or company
   */
  async searchByName(searchTerm: string): Promise<DbResponse<Customer[]>> {
    try {
      const allCustomersResult = await this.getAll();
      if (!allCustomersResult.success || !allCustomersResult.data) {
        return allCustomersResult;
      }

      const searchLower = searchTerm.toLowerCase();
      const filtered = allCustomersResult.data.filter(
        customer =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.companyName.toLowerCase().includes(searchLower) ||
          customer.contactPerson.toLowerCase().includes(searchLower)
      );

      return {
        success: true,
        data: filtered,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  /**
   * Get active customers
   */
  async getActiveCustomers(): Promise<DbResponse<Customer[]>> {
    return this.find({ isActive: true });
  }

  /**
   * Update customer
   */
  async update(customerId: string, data: UpdateCustomerInput): Promise<DbResponse<Customer>> {
    return super.update(customerId, data);
  }

  /**
   * Deactivate customer (soft delete)
   */
  async deactivate(customerId: string): Promise<DbResponse<Customer>> {
    // Check if customer has active projects
    const statsResult = await this.getCustomerStatistics(customerId);
    if (statsResult.success && statsResult.data && statsResult.data.activeProjects > 0) {
      return {
        success: false,
        error: 'Cannot deactivate customer with active projects',
      };
    }

    return this.update(customerId, { isActive: false });
  }

  /**
   * Get customers by industry
   */
  async getByIndustry(industry: string): Promise<DbResponse<Customer[]>> {
    return this.find({ industry });
  }

  /**
   * Get recent customers
   */
  async getRecentCustomers(limit: number = 10): Promise<DbResponse<Customer[]>> {
    try {
      const allCustomersResult = await this.getAll();
      if (!allCustomersResult.success || !allCustomersResult.data) {
        return allCustomersResult;
      }

      const sorted = allCustomersResult.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        success: true,
        data: sorted.slice(0, limit),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recent customers',
      };
    }
  }

  /**
   * Merge duplicate customers
   */
  async mergeCustomers(
    primaryCustomerId: string,
    secondaryCustomerId: string
  ): Promise<DbResponse<Customer>> {
    try {
      // Get both customers
      const primaryResult = await this.getById(primaryCustomerId);
      const secondaryResult = await this.getById(secondaryCustomerId);

      if (!primaryResult.success || !secondaryResult.success) {
        return {
          success: false,
          error: 'One or both customers not found',
        };
      }

      // Update all projects from secondary to primary customer
      const projectsResult = await this.db.getAll('projects');
      if (projectsResult.success && projectsResult.data) {
        const projectsToUpdate = projectsResult.data.filter(
          (project: Project) => project.customer.id === secondaryCustomerId
        );

        for (const project of projectsToUpdate) {
          await this.db.update('projects', project.id, {
            customer: {
              ...project.customer,
              id: primaryCustomerId,
              name: primaryResult.data!.name,
              companyName: primaryResult.data!.companyName,
            },
          });
        }
      }

      // Deactivate secondary customer
      await this.deactivate(secondaryCustomerId);

      return primaryResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to merge customers',
      };
    }
  }
}