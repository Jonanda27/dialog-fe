// File: dialog-fe/types/admin.ts

export interface DashboardSummary {
  total_gmv: number;
  total_users: number;
  total_stores: number;
  active_disputes: number;
  pending_verification: number;
}

export interface TransactionAnalytics {
  date: string;
  count: number;
  total: number;
}

export interface AdminActivityLog {
  type: 'STORE_REGISTRATION' | 'DISPUTE_TRANSACTION' | 'USER_REPORT' | 'HIGH_VALUE_TRANSACTION';
  message: string;
  time: string; // ISO Date string dari BE
}

export interface DashboardData {
  summary: DashboardSummary;
  chart_data: TransactionAnalytics[];
  recent_activities: AdminActivityLog[];
}