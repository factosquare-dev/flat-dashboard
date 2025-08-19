/**
 * Transaction Manager
 * Handles database transactions
 */

import { DbTransaction, DbOperation, DbResponse, MockDatabase } from '@/mocks/database/types';

export class TransactionManager {
  private transactions: Map<string, DbTransaction>;

  constructor() {
    this.transactions = new Map();
  }

  /**
   * Begin a new transaction
   */
  beginTransaction(): string {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.transactions.set(transactionId, {
      id: transactionId,
      operations: [],
      status: 'pending',
      timestamp: new Date(),
    });
    return transactionId;
  }

  /**
   * Add operation to transaction
   */
  addOperation(transactionId: string, operation: DbOperation): void {
    const transaction = this.transactions.get(transactionId);
    if (transaction && transaction.status === 'pending') {
      transaction.operations.push(operation);
    }
  }

  /**
   * Commit a transaction
   */
  async commitTransaction(
    transactionId: string, 
    applyOperation: (op: DbOperation) => Promise<void>
  ): Promise<DbResponse<void>> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    if (transaction.status !== 'pending') {
      return {
        success: false,
        error: `Transaction already ${transaction.status}`,
      };
    }

    try {
      // Apply all operations
      for (const op of transaction.operations) {
        await applyOperation(op);
      }

      transaction.status = 'committed';
      
      return {
        success: true,
        message: 'Transaction committed successfully',
      };
    } catch (error) {
      // Rollback will be handled by the caller
      transaction.status = 'failed';
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }

  /**
   * Rollback a transaction
   */
  async rollbackTransaction(
    transactionId: string,
    rollbackOperation: (op: DbOperation) => Promise<void>
  ): Promise<DbResponse<void>> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    try {
      // Rollback operations in reverse order
      for (let i = transaction.operations.length - 1; i >= 0; i--) {
        await rollbackOperation(transaction.operations[i]);
      }

      transaction.status = 'rolled_back';
      
      return {
        success: true,
        message: 'Transaction rolled back successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rollback failed',
      };
    }
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): DbTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): DbTransaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Clean up old transactions
   */
  cleanupTransactions(olderThan: Date): number {
    let cleaned = 0;
    this.transactions.forEach((transaction, id) => {
      if (transaction.timestamp < olderThan && transaction.status !== 'pending') {
        this.transactions.delete(id);
        cleaned++;
      }
    });
    return cleaned;
  }

  /**
   * Clear all transactions
   */
  clearTransactions(): void {
    this.transactions.clear();
  }
}