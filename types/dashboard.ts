export interface DashboardStats {
  totalClients: number
  activeClients: number
  newClientsThisMonth: number
  totalPlans: number
  activePlans: number
  completedPlans: number
  totalRevenue: number
  monthlyRevenue: number
  averageClientSatisfaction: number
  pendingTasks: number
}

export interface DashboardChart {
  id: string
  title: string
  type: "line" | "bar" | "pie" | "area" | "donut"
  data: any[]
  config: {
    xAxis?: string
    yAxis?: string
    colors?: string[]
    period?: "daily" | "weekly" | "monthly" | "yearly"
  }
}

export interface DashboardWidget {
  id: string
  title: string
  type: "stat" | "chart" | "list" | "progress" | "calendar"
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  data: any
  config: {
    refreshInterval?: number
    showHeader?: boolean
    allowResize?: boolean
    allowMove?: boolean
  }
  isVisible?: boolean
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: DashboardWidget[]
  isDefault: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface RecentActivity {
  id: string
  type: "client_added" | "plan_created" | "message_received" | "appointment_scheduled" | "report_generated"
  title: string
  description: string
  userId?: string
  userName?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface UpcomingTask {
  id: string
  title: string
  description?: string
  type: "appointment" | "follow_up" | "plan_review" | "report_due" | "payment_due"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: Date
  clientId?: string
  clientName?: string
  status: "pending" | "in_progress" | "completed" | "overdue"
}

export interface DashboardNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  priority: "low" | "medium" | "high"
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
  createdAt: Date
}

export interface DashboardFilters {
  period?: "today" | "week" | "month" | "quarter" | "year"
  clientId?: string
  planType?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface DashboardPreferences {
  defaultLayout: string
  refreshInterval: number
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  widgets: {
    [key: string]: {
      visible: boolean
      position: { x: number; y: number; width: number; height: number }
    }
  }
}

export enum TimePeriod {
  TODAY = "today",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

export type ChartPeriod = "daily" | "weekly" | "monthly" | "yearly"

export enum ExportFormat {
  PDF = "pdf",
  EXCEL = "excel",
  CSV = "csv",
  JSON = "json",
}

export interface DashboardExport {
  format: ExportFormat
  data: any
  filename: string
  createdAt: Date
}
