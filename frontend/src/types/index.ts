// Enums matching .NET 9 Backend
export type FeedbackStatus = 
  | 'Submitted'
  | 'Processing'
  | 'InProgress'
  | 'ResolvedPendingApproval'
  | 'Published'
  | 'Rejected'
  | 'Closed';

export type FeedbackPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type UserRole = 'Citizen' | 'Officer' | 'Dispatcher' | 'Admin';

export type AttachmentType = 'CitizenUpload' | 'ProgressUpdate' | 'ResolutionProof';

// Entity Models & DTOs
export interface FeedbackAttachment {
  id: string;
  feedbackId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSizeBytes: number;
  attachmentType: AttachmentType;
  createdAt: string;
}

export interface FeedbackLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  note?: string;
  createdAt: string;
}

export interface FeedbackRating {
  id: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface FeedbackDetail {
  id: string;
  trackingCode: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  citizenName: string;
  citizenPhone?: string;
  citizenEmail?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: FeedbackStatus | number;
  statusName: FeedbackStatus;
  priority: FeedbackPriority | number;
  slaDeadline?: string;
  isOverdue: boolean;
  hoursLeft?: number;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  resolutionSummary?: string;
  resolvedAt?: string;
  slaLabel?: string;
  createdAt: string;
  attachments: FeedbackAttachment[];
  citizenUploads: FeedbackAttachment[];
  resolutionProofs: FeedbackAttachment[];
  progressUploads: FeedbackAttachment[];
  logs: FeedbackLog[];
  rating?: FeedbackRating;
}

export interface FeedbackPublic {
  id: string;
  trackingCode: string;
  title: string;
  content: string;
  categoryName: string;
  categoryIcon?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: FeedbackStatus | number;
  statusName: FeedbackStatus;
  priority: FeedbackPriority | number;
  resolutionSummary?: string;
  resolvedAt?: string;
  createdAt: string;
  attachments: FeedbackAttachment[];
  rating?: FeedbackRating;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  defaultSlaHours: number;
  displayOrder: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headName?: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: UserRole;
  userId: string;
  email?: string;
  phoneNumber?: string;
  departmentId?: string;
  departmentName?: string;
  expiresAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Stitch Dashboard KPI & Analytics DTOs
export interface DashboardKpiSummary {
  totalReports: number;
  totalReportsGrowth?: string;
  slaComplianceRate: number;
  slaTargetComparison?: string;
  avgResolutionTimeDays: number;
  avgResolutionTimeGrowth?: string;
  activeAlertsCount: number;
}

export interface OverviewStats {
  totalFeedbacks: number;
  submitted: number;
  processing: number;
  inProgress: number;
  resolvedPendingApproval: number;
  published: number;
  rejected: number;
  overdue: number;
  averageRating: number;
  slaComplianceRate: number;
}

export interface CategoryStats {
  categoryName: string;
  icon?: string;
  total: number;
  resolved: number;
  slaRate: number;
  percentage: number;
}

export interface DepartmentStats {
  departmentName: string;
  assigned: number;
  inProgress: number;
  resolved: number;
  overdue: number;
  slaRate: number;
  averageRating: number;
}

export interface WeeklyTrend {
  weekLabel: string;
  receivedCount: number;
  resolvedCount: number;
}

export interface SlaAlertItem {
  id: string;
  trackingCode: string;
  title: string;
  categoryName: string;
  alertType: 'OVERDUE' | 'AT RISK' | string;
  dueMessage: string;
  hoursRemaining: number;
  slaDeadline?: string;
  assignedDepartmentName?: string;
}

export interface LatestReportItem {
  id: string;
  trackingCode: string;
  categoryName: string;
  title: string;
  description: string;
  submittedRelativeTime: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface DashboardData {
  kpiSummary: DashboardKpiSummary;
  overview: OverviewStats;
  byCategory: CategoryStats[];
  byDepartment: DepartmentStats[];
  weeklyTrends: WeeklyTrend[];
  slaAlerts: SlaAlertItem[];
  latestIncomingReports: LatestReportItem[];
}
