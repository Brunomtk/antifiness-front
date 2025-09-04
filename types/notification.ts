export interface Notification {
  id: number
  userId: number
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  data?: NotificationData
  read: boolean
  priority: NotificationPriority
  createdAt: string
  readAt?: string
  expiresAt?: string
  actionUrl?: string
  actionLabel?: string
}

export enum NotificationType {
  SYSTEM = 1,
  DIET = 2,
  WORKOUT = 3,
  PLAN = 4,
  MESSAGE = 5,
  REMINDER = 6,
  ACHIEVEMENT = 7,
  ALERT = 8,
}

export enum NotificationCategory {
  INFO = 1,
  SUCCESS = 2,
  WARNING = 3,
  ERROR = 4,
  REMINDER = 5,
}

export enum NotificationPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
}

export interface NotificationData {
  entityId?: number
  entityType?: string
  metadata?: string
  imageUrl?: string
  progress?: number
  value?: number
  unit?: string
}

export interface NotificationSettings {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  categories: {
    [key in NotificationCategory]: boolean
  }
  types: {
    [key in NotificationType]: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  frequency: NotificationFrequency
  updatedAt: Date
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface NotificationTemplate {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  readRate: number
  averageReadTime: number
  mostActiveHour: number
  weeklyTrend: number[]
}

export interface NotificationFilters {
  type?: NotificationType
  category?: NotificationCategory
  priority?: NotificationPriority
  read?: boolean
  userId?: number
  start?: string
  end?: string
}

export interface CreateNotificationData {
  userId: number
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  data?: NotificationData
  priority?: NotificationPriority
  expiresAt?: string
  actionUrl?: string
  actionLabel?: string
}

export interface UpdateNotificationData {
  read: boolean
  readAt: string
}

export interface MarkAllReadData {
  userId: number
}

export interface NotificationBatch {
  notifications: Notification[]
  hasMore: boolean
  total: number
  page: number
  limit: number
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: number
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface NotificationSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent: string
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}
