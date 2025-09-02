export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    username: string;
    nombre: string;
    apellido: string;
  };
}

export interface NotificationFormData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  expires_at?: string;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  is_active?: boolean;
  search?: string;
}

export interface NotificationStats {
  total: number;
  active: number;
  expired: number;
  by_type: {
    info: number;
    warning: number;
    error: number;
    success: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  data?: Notification[];
  stats?: NotificationStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
} 