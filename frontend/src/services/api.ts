import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Account,
  Transaction,
  Party,
  Receipt,
  LoginRequest,
  LoginResponse,
  CreateAccountRequest,
  CreateTransactionRequest,
  UpdateBalanceRequest,
  CreatePartyRequest,
  DashboardData,
  PaginatedResponse,
  TransactionFilters,
  MfaSetupResponse,
  AuditLogEntry,
  UserSettings,
  ApiError,
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data.message || 'An error occurred',
        code: error.response.data.code || 'UNKNOWN_ERROR',
        details: error.response.data.details,
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'CLIENT_ERROR',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/refresh');
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async setupMfa(): Promise<MfaSetupResponse> {
    const response: AxiosResponse<MfaSetupResponse> = await this.api.post('/auth/mfa/setup');
    return response.data;
  }

  async verifyMfa(token: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> = await this.api.post('/auth/mfa/verify', {
      token,
    });
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/users/me');
    return response.data;
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response: AxiosResponse<UserSettings> = await this.api.put('/users/me/settings', settings);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardData(): Promise<DashboardData> {
    const response: AxiosResponse<DashboardData> = await this.api.get('/dashboard');
    return response.data;
  }

  // Account endpoints
  async getAccounts(): Promise<Account[]> {
    const response: AxiosResponse<Account[]> = await this.api.get('/accounts');
    return response.data;
  }

  async getAccount(id: number): Promise<Account> {
    const response: AxiosResponse<Account> = await this.api.get(`/accounts/${id}`);
    return response.data;
  }

  async createAccount(account: CreateAccountRequest): Promise<Account> {
    const response: AxiosResponse<Account> = await this.api.post('/accounts', account);
    return response.data;
  }

  async updateAccountBalance(accountId: number, balance: string): Promise<Account> {
    const response: AxiosResponse<Account> = await this.api.put(`/accounts/${accountId}/balance`, {
      newBalance: balance,
    });
    return response.data;
  }

  async deleteAccount(id: number): Promise<void> {
    await this.api.delete(`/accounts/${id}`);
  }

  // Transaction endpoints
  async getTransactions(
    filters?: TransactionFilters,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('pageSize', pageSize.toString());

    const response: AxiosResponse<PaginatedResponse<Transaction>> = await this.api.get(
      `/transactions?${params.toString()}`
    );
    return response.data;
  }

  async getTransaction(id: number): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await this.api.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await this.api.post('/transactions', transaction);
    return response.data;
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.api.delete(`/transactions/${id}`);
  }

  // Party endpoints
  async getParties(): Promise<Party[]> {
    const response: AxiosResponse<Party[]> = await this.api.get('/parties');
    return response.data;
  }

  async getParty(id: number): Promise<Party> {
    const response: AxiosResponse<Party> = await this.api.get(`/parties/${id}`);
    return response.data;
  }

  async createParty(party: CreatePartyRequest): Promise<Party> {
    const response: AxiosResponse<Party> = await this.api.post('/parties', party);
    return response.data;
  }

  async updateParty(id: number, party: Partial<CreatePartyRequest>): Promise<Party> {
    const response: AxiosResponse<Party> = await this.api.put(`/parties/${id}`, party);
    return response.data;
  }

  async deleteParty(id: number): Promise<void> {
    await this.api.delete(`/parties/${id}`);
  }

  // Receipt endpoints
  async uploadReceipt(transactionId: number, file: File): Promise<Receipt> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('transactionId', transactionId.toString());

    const response: AxiosResponse<Receipt> = await this.api.post('/receipts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getReceipts(transactionId?: number): Promise<Receipt[]> {
    const params = transactionId ? `?transactionId=${transactionId}` : '';
    const response: AxiosResponse<Receipt[]> = await this.api.get(`/receipts${params}`);
    return response.data;
  }

  async downloadReceipt(id: number): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(`/receipts/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteReceipt(id: number): Promise<void> {
    await this.api.delete(`/receipts/${id}`);
  }

  // Analytics endpoints
  async getSpendingAnalytics(
    accountId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId.toString());
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await this.api.get(`/analytics/spending?${params.toString()}`);
    return response.data;
  }

  async getCategoryBreakdown(
    accountId?: number,
    period?: 'month' | 'quarter' | 'year'
  ): Promise<any> {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId.toString());
    if (period) params.append('period', period);

    const response = await this.api.get(`/analytics/categories?${params.toString()}`);
    return response.data;
  }

  // Audit endpoints
  async getAuditLogs(
    page?: number,
    pageSize?: number,
    userId?: string
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('pageSize', pageSize.toString());
    if (userId) params.append('userId', userId);

    const response: AxiosResponse<PaginatedResponse<AuditLogEntry>> = await this.api.get(
      `/audit/logs?${params.toString()}`
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
