import axios from 'axios';
import {
  AuthResponse,
  Category,
  DashboardData,
  Department,
  FeedbackDetail,
  FeedbackPublic,
  PagedResult,
  SlaAlertItem,
  User,
  WeeklyTrend,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('reflectgov_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  register: async (data: { username: string; password: string; fullName: string; email?: string; phoneNumber?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

// Citizen Feedback API
export const feedbackApi = {
  submitFeedback: async (formData: FormData): Promise<FeedbackDetail> => {
    const res = await api.post<FeedbackDetail>('/feedbacks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  trackByCode: async (trackingCode: string): Promise<FeedbackDetail> => {
    const res = await api.get<FeedbackDetail>(`/feedbacks/track/${encodeURIComponent(trackingCode)}`);
    return res.data;
  },
  getMyFeedbacks: async (): Promise<FeedbackDetail[]> => {
    const res = await api.get<FeedbackDetail[]>('/feedbacks/my-feedbacks');
    return res.data;
  },
  getPublicFeedbacks: async (params?: { categoryId?: string; search?: string }): Promise<FeedbackPublic[]> => {
    const res = await api.get<FeedbackPublic[]>('/feedbacks/public', { params });
    return res.data;
  },
  getFeedbackById: async (id: string): Promise<FeedbackDetail> => {
    const res = await api.get<FeedbackDetail>(`/feedbacks/${id}`);
    return res.data;
  },
  rateFeedback: async (
    id: string,
    rating: { score: number; comment?: string; phoneVerification?: string }
  ): Promise<{ id: string; score: number; comment?: string }> => {
    const res = await api.post(`/feedbacks/${id}/rate`, rating);
    return res.data;
  },
};

// Admin & Officer Management API
export const adminFeedbackApi = {
  getFeedbacksPaged: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    priority?: string;
    categoryId?: string;
    departmentId?: string;
    assignedUserId?: string;
    isOverdue?: boolean;
    fromDate?: string;
    toDate?: string;
  }): Promise<PagedResult<FeedbackDetail>> => {
    const res = await api.get<PagedResult<FeedbackDetail>>('/admin/feedbacks', { params });
    return res.data;
  },
  verifyFeedback: async (id: string, data: { isApproved: boolean; rejectReason?: string }): Promise<FeedbackDetail> => {
    const res = await api.post<FeedbackDetail>(`/admin/feedbacks/${id}/verify`, data);
    return res.data;
  },
  assignFeedback: async (id: string, data: {
    departmentId: string;
    assignedUserId?: string;
    priority: number;
    customSlaHours?: number;
    note?: string;
  }): Promise<FeedbackDetail> => {
    const res = await api.post<FeedbackDetail>(`/admin/feedbacks/${id}/assign`, data);
    return res.data;
  },
  updateProgress: async (id: string, formData: FormData): Promise<FeedbackDetail> => {
    const res = await api.post<FeedbackDetail>(`/admin/feedbacks/${id}/progress`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  resolveFeedback: async (id: string, formData: FormData): Promise<FeedbackDetail> => {
    const res = await api.post<FeedbackDetail>(`/admin/feedbacks/${id}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  approveFeedback: async (id: string, data: { isApproved: boolean; note?: string }): Promise<FeedbackDetail> => {
    const res = await api.post<FeedbackDetail>(`/admin/feedbacks/${id}/approve`, data);
    return res.data;
  },
};

// Analytics & Dashboard API
export const statsApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get<DashboardData>('/stats/dashboard');
    return res.data;
  },
  getSlaAlerts: async (): Promise<SlaAlertItem[]> => {
    const res = await api.get<SlaAlertItem[]>('/stats/sla-alerts');
    return res.data;
  },
  getWeeklyTrends: async (): Promise<WeeklyTrend[]> => {
    const res = await api.get<WeeklyTrend[]>('/stats/weekly-trends');
    return res.data;
  },
};

// Master Data API
export const masterDataApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
  getDepartments: async (): Promise<Department[]> => {
    const res = await api.get<Department[]>('/departments');
    return res.data;
  },
  getUsers: async (params?: { departmentId?: string; role?: string }): Promise<User[]> => {
    const res = await api.get<User[]>('/users', { params });
    return res.data;
  },
  toggleUserActive: async (id: string): Promise<void> => {
    await api.patch(`/users/${id}/toggle-active`);
  },
};

export default api;
