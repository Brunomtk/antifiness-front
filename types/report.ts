export interface Report {
  id: string
  title: string
  type: ReportType
  clientId: string
  clientName: string
  nutritionistId: string
  period: {
    start: Date
    end: Date
  }
  data: ReportData
  status: ReportStatus
  createdAt: Date
  updatedAt: Date
  recipients: string[]
  createdBy: string
  schedule?: ReportSchedule
  expiresAt?: Date
}

export interface ReportData {
  summary: string
  metrics: ReportMetric[]
  charts: ReportChart[]
  recommendations: string[]
  notes?: string
}

export interface ReportMetric {
  id: string
  name: string
  value: number
  unit: string
  change?: {
    value: number
    percentage: number
    trend: "up" | "down" | "stable"
  }
  target?: number
}

export interface ReportChart {
  id: string
  title: string
  type: "line" | "bar" | "pie" | "area"
  data: any[]
  config: {
    xAxis?: string
    yAxis?: string
    colors?: string[]
  }
}

export interface ReportTable {
  id: string
  title: string
  headers: string[]
  rows: Array<Array<string | number>>
  pagination?: {
    page: number
    limit: number
    total: number
  }
  sorting?: {
    column: string
    direction: "asc" | "desc"
  }
}

export interface ReportInsight {
  id: string
  type: InsightType
  title: string
  description: string
  severity: InsightSeverity
  confidence: number // 0-100
  recommendations?: string[]
  relatedMetrics?: string[]
}

export interface ReportFilters {
  type?: ReportType
  clientId?: string
  status?: ReportStatus
  dateFrom?: Date
  dateTo?: Date
}

export interface ReportSchedule {
  id: string
  frequency: ScheduleFrequency
  dayOfWeek?: number // 0-6 (Sunday-Saturday)
  dayOfMonth?: number // 1-31
  time: string // HH:mm format
  timezone: string
  isActive: boolean
  nextRun?: Date
  lastRun?: Date
}

export interface ReportTemplate {
  id: string
  name: string
  type: ReportType
  description: string
  structure: {
    sections: string[]
    metrics: string[]
    charts: string[]
  }
  isDefault: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ReportStats {
  totalReports: number
  scheduledReports: number
  generatedThisMonth: number
  averageGenerationTime: number // em segundos
  popularTypes: Array<{
    type: string
    count: number
  }>
  popularFormats: Array<{
    format: string
    count: number
  }>
  monthlyGeneration: Array<{
    month: string
    count: number
  }>
}

export interface CreateReportData {
  title: string
  type: ReportType
  clientId: string
  period: {
    start: Date
    end: Date
  }
  data: ReportData
}

export interface UpdateReportData {
  title?: string
  data?: Partial<ReportData>
  status?: ReportStatus
}

export enum InsightType {
  TREND = "trend",
  ANOMALY = "anomaly",
  CORRELATION = "correlation",
  PREDICTION = "prediction",
  RECOMMENDATION = "recommendation",
}

export enum InsightSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ScheduleFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

export enum ReportStatus {
  DRAFT = "draft",
  COMPLETED = "completed",
  SENT = "sent",
}

export enum ReportType {
  PROGRESS = "progress",
  NUTRITION = "nutrition",
  WORKOUT = "workout",
  GENERAL = "general",
}
