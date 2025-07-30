// API Types for FinWise Banking Application
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  mfaEnabled: boolean;
  lastLogin?: string;
}

export interface Account {
  id: number;
  partyId: number;
  balance: string; // Using string for BigDecimal precision
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  amount: string; // Using string for BigDecimal precision
  transactionType: TransactionType;
  description: string;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  balance?: string;
}

export interface Party {
  id: number;
  name: string;
  type: PartyType;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: number;
  transactionId: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  LOAN = 'loan'
}

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

export enum PartyType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  BANK = 'bank'
}

// API Request/Response types
// Form data types
export interface LoginFormData {
  email: string;
  password: string;
  mfaToken?: string;
}

// API request types
export interface LoginRequest {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Dashboard data types
export interface DashboardData {
  totalBalance: string;
  accounts: Account[];
  recentTransactions: Transaction[];
  monthlySpending: MonthlySpendingData[];
  categoryBreakdown: CategoryBreakdownData[];
}

export interface MonthlySpendingData {
  month: string;
  amount: string;
  income: string;
  expenses: string;
}

export interface CategoryBreakdownData {
  category: string;
  amount: string;
  percentage: number;
  color: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
  requiresMfa: boolean;
}

export interface CreateAccountRequest {
  partyId: number;
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  initialBalance: string;
  currency?: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  amount: string;
  transactionType: TransactionType;
  description: string;
  category: string;
  date?: string;
}

export interface UpdateBalanceRequest {
  accountId: number;
  newBalance: string;
}

export interface CreatePartyRequest {
  name: string;
  type: PartyType;
  email?: string;
  phone?: string;
  address?: string;
}

// Dashboard types
export interface DashboardData {
  totalBalance: string;
  accounts: Account[];
  recentTransactions: Transaction[];
  monthlySpending: MonthlySpending[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface MonthlySpending {
  month: string;
  amount: string;
  income: string;
  expenses: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: string;
  percentage: number;
  color: string;
}

// Form types
export interface AccountFormData {
  partyId: number;
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  initialBalance: string;
  currency: string;
}

export interface TransactionFormData {
  accountId: number;
  amount: string;
  transactionType: TransactionType;
  description: string;
  category: string;
  date: Date;
}

export interface PartyFormData {
  name: string;
  type: PartyType;
  email: string;
  phone: string;
  address: string;
}

// API Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Filter and pagination types
export interface TransactionFilters {
  accountId?: number;
  transactionType?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
}

// Security types
export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface SessionInfo {
  sessionId: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

// Audit log types
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  riskScore: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  variant: 'primary' | 'secondary';
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    mfaEnabled: boolean;
    sessionTimeout: number;
  };
}


