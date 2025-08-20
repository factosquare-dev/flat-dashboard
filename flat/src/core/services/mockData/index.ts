/**
 * Mock Data Service
 * 중앙집중식 데이터 관리를 위한 서비스
 * 모든 하드코딩된 데이터를 Mock DB를 통해 관리
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { FactoryDataService } from './factoryService';
import { ProjectDataService } from './projectService';
import { ProductDataService } from './productService';
import { TaskDataService } from './taskService';
import { CustomerDataService } from './customerService';
import { UserDataService } from './userService';

// Re-export types for convenience
export type { Factory } from '@/shared/types/factory';
export type { Task } from '@/shared/types/schedule';
export type { Project } from '@/shared/types/project';
export type { ProductCategory, Product } from '@/shared/types/product';
export type { Customer } from '@/shared/types/customer';
export type { User } from '@/shared/types/user';

class MockDataService {
  private db: MockDatabaseImpl;
  private factoryService: FactoryDataService;
  private projectService: ProjectDataService;
  private productService: ProductDataService;
  private taskService: TaskDataService;
  private customerService: CustomerDataService;
  private userService: UserDataService;

  constructor() {
    this.db = MockDatabaseImpl.getInstance();
    this.factoryService = new FactoryDataService(this.db);
    this.projectService = new ProjectDataService(this.db);
    this.productService = new ProductDataService(this.db);
    this.taskService = new TaskDataService(this.db);
    this.customerService = new CustomerDataService(this.db);
    this.userService = new UserDataService(this.db);
  }

  /**
   * Factory 관련 메서드
   */
  getAllFactories = () => this.factoryService.getAllFactories();
  getFactoriesByType = (type: string) => this.factoryService.getFactoriesByType(type);
  getFactoryById = (id: string) => this.factoryService.getFactoryById(id);
  getTaskTypesForFactory = (factoryId: string) => this.factoryService.getTaskTypesForFactory(factoryId);
  getManufacturingFactories = () => this.factoryService.getManufacturingFactories();
  getContainerFactories = () => this.factoryService.getContainerFactories();
  getPackagingFactories = () => this.factoryService.getPackagingFactories();

  /**
   * Project 관련 메서드
   */
  getAllProjects = () => this.projectService.getAllProjects();
  getMasterProjects = () => this.projectService.getMasterProjects();
  getChildProjects = (parentId: string) => this.projectService.getChildProjects(parentId);
  getProjectById = (id: string) => this.projectService.getProjectById(id);
  getProjectHierarchy = (projectId: string) => this.projectService.getProjectHierarchy(projectId);
  createProject = (project: any) => this.projectService.createProject(project);
  updateProject = (id: string, updates: any) => this.projectService.updateProject(id, updates);
  deleteProject = (id: string) => this.projectService.deleteProject(id);

  /**
   * ProductCategory 관련 메서드
   */
  getProductCategories = () => this.productService.getProductCategories();
  getProductCategoriesHierarchy = () => this.productService.getProductCategoriesHierarchy();
  getProductCategoryById = (id: string) => this.productService.getProductCategoryById(id);
  createProductCategory = (category: any) => this.productService.createProductCategory(category);
  updateProductCategory = (id: string, updates: any) => this.productService.updateProductCategory(id, updates);
  deleteProductCategory = (id: string) => this.productService.deleteProductCategory(id);

  /**
   * Product 관련 메서드
   */
  getProducts = () => this.productService.getProducts();
  getProductsByCategory = (categoryId: string) => this.productService.getProductsByCategory(categoryId);
  getProductById = (id: string) => this.productService.getProductById(id);
  createProduct = (product: any) => this.productService.createProduct(product);
  updateProduct = (id: string, updates: any) => this.productService.updateProduct(id, updates);
  deleteProduct = (id: string) => this.productService.deleteProduct(id);

  /**
   * Task 관련 메서드
   */
  getAllTasks = () => this.taskService.getAllTasks();
  getTasksBySchedule = (scheduleId: string) => this.taskService.getTasksBySchedule(scheduleId);
  getTasksByProject = (projectId: string) => this.taskService.getTasksByProject(projectId);
  getTasksByProjectId = (projectId: string) => this.taskService.getTasksByProject(projectId); // Alias for compatibility
  getTaskById = (id: string) => this.taskService.getTaskById(id);
  createTask = (task: any) => this.taskService.createTask(task);
  updateTask = (id: string, updates: any) => this.taskService.updateTask(id, updates);
  deleteTask = (id: string) => this.taskService.deleteTask(id);
  reorderTasks = (scheduleId: string, taskIds: string[]) => this.taskService.reorderTasks(scheduleId, taskIds);
  
  // Task-Centric methods
  assignFactoryToTask = (taskId: string, factory: any) => this.taskService.assignFactoryToTask(taskId, factory);
  removeFactoryFromTask = (taskId: string, factoryId: string) => this.taskService.removeFactoryFromTask(taskId, factoryId);
  updateFactoryAssignment = (taskId: string, factoryId: string, updates: any) => this.taskService.updateFactoryAssignment(taskId, factoryId, updates);
  getTasksByFactory = (factoryId: string) => this.taskService.getTasksByFactory(factoryId);
  getFactoryCount = (taskId: string) => this.taskService.getFactoryCount(taskId);

  /**
   * Customer 관련 메서드
   */
  getCustomers = () => this.customerService.getAllCustomers();
  searchCustomers = (searchTerm: string) => this.customerService.searchCustomers(searchTerm);
  getCustomerById = (id: string) => this.customerService.getCustomerById(id);
  getActiveCustomers = () => this.customerService.getActiveCustomers();

  /**
   * User 관련 메서드
   */
  getUsers = () => this.userService.getAllUsers();
  searchUsers = (searchTerm: string) => this.userService.searchUsers(searchTerm);
  getUserById = (id: string) => this.userService.getUserById(id);
  getUsersByRole = (role: any) => this.userService.getUsersByRole(role);
  getManagers = () => this.userService.getManagers();
  getActiveUsers = () => this.userService.getActiveUsers();
}

// Singleton instance
export const mockDataService = new MockDataService();