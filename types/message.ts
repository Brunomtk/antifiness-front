// Enums
export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  DOCUMENT = 3,
  AUDIO = 4,
  VIDEO = 5,
  SYSTEM = 6,
}

export enum MessageStatus {
  SENT = 1,
  DELIVERED = 2,
  READ = 3,
  FAILED = 4,
}

export enum ConversationType {
  DIRECT = 1,
  GROUP = 2,
  CHANNEL = 3,
}

export enum ParticipantRole {
  MEMBER = 1,
  ADMIN = 2,
  MODERATOR = 3,
}

export enum AttachmentType {
  IMAGE = 1,
  DOCUMENT = 2,
  AUDIO = 3,
  VIDEO = 4,
}

export enum TemplateCategory {
  GREETING = 1,
  APPOINTMENT = 2,
  REMINDER = 3,
  FOLLOW_UP = 4,
  GENERAL = 5,
}

// Base interfaces
export interface AttachmentMetadata {
  width?: number | null
  height?: number | null
  duration?: number | null
  description?: string | null
  customData?: string | null
}

export interface Attachment {
  id?: number
  type: AttachmentType
  name: string
  url: string
  size: number
  mimeType: string
  thumbnail?: string | null
  metadata?: AttachmentMetadata
}

export interface MessageMetadata {
  edited: boolean
  editReason?: string | null
  systemAction?: string | null
  customData?: string | null
}

export interface Reaction {
  id: number
  userId: number
  userName: string
  emoji: string
  createdAt: string
}

export interface ParticipantPermissions {
  canSendMessages: boolean
  canSendAttachments: boolean
  canDeleteMessages: boolean
  canEditMessages?: boolean
  canAddParticipants?: boolean
  canRemoveParticipants?: boolean
  canEditConversation?: boolean
  canMentionAll?: boolean
}

export interface Participant {
  userId: number
  userName: string
  role: ParticipantRole
  joinedAt: string
  lastSeenAt?: string | null
  isOnline: boolean
  permissions: ParticipantPermissions
}

export interface ConversationSettings {
  notifications: boolean
  soundEnabled: boolean
  autoArchive: boolean
  retentionDays?: number
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  receiverId: number
  receiverName?: string | null
  type: MessageType
  status: MessageStatus
  content: string
  replyToId?: number | null
  createdAt: string
  updatedAt: string
  readAt?: string | null
  deliveredAt?: string | null
  attachments: Attachment[]
  reactions: Reaction[]
  metadata: MessageMetadata
  replyTo?: Message | null
}

export interface Conversation {
  id: number
  empresasId?: number
  type: ConversationType
  title?: string | null
  description?: string | null
  isArchived: boolean
  isMuted: boolean
  unreadCount: number
  createdAt: string
  updatedAt: string
  participants: Participant[]
  lastMessage?: Message | null
  settings?: ConversationSettings
}

export interface MessageTemplate {
  id: number
  empresasId?: number
  name: string
  content: string
  category: TemplateCategory
  variables: string[]
  isPublic: boolean
  usageCount: number
  createdBy: number
  createdByName?: string
  createdAt: string
  updatedAt?: string
}

// Request interfaces
export interface CreateMessageRequest {
  conversationId: number
  senderId: number
  receiverId: number
  type: MessageType
  content: string
  replyToId?: number | null
  attachments?: Attachment[]
  metadata?: {
    systemAction?: string | null
    customData?: string | null
  }
}

export interface UpdateMessageRequest {
  content?: string
  editReason?: string
}

export interface CreateConversationRequest {
  empresasId?: number
  type: ConversationType
  title?: string
  description?: string
  participantIds: number[]
}

export interface UpdateConversationRequest {
  title?: string
  description?: string
  settings?: Partial<ConversationSettings>
}

export interface AddParticipantRequest {
  userId: number
  role: ParticipantRole
}

export interface UpdateParticipantRequest {
  role?: ParticipantRole
  permissions?: Partial<ParticipantPermissions>
}

export interface MarkMessagesReadRequest {
  messageIds: number[]
  userId: number
}

export interface AddReactionRequest {
  userId: number
  emoji: string
}

export interface CreateTemplateRequest {
  empresasId?: number
  name: string
  content: string
  category: TemplateCategory
  variables: string[]
  isPublic: boolean
  createdBy: number
}

export interface UpdateTemplateRequest {
  name?: string
  content?: string
  category?: TemplateCategory
  variables?: string[]
  isPublic?: boolean
}

export interface RenderTemplateRequest {
  variables: Record<string, string>
}

// Response interfaces
export interface ConversationsPagedResponse {
  conversations: Conversation[]
  hasMore: boolean
  total: number
  page: number
  limit: number
}

export interface MessagesPagedResponse {
  messages: Message[]
  hasMore: boolean
  total: number
  page: number
  limit: number
}

export interface ConversationStatsResponse {
  totalMessages: number
  totalParticipants: number
  messagesThisWeek: number
  messagesThisMonth: number
  averageResponseTime: number
  mostActiveParticipant: string
  lastActivity: string
}

export interface MessageStatsResponse {
  totalMessages: number
  messagesThisWeek: number
  messagesThisMonth: number
  averageMessagesPerDay: number
  mostActiveHour: number
  messagesByType: Record<string, number>
  topSenders: Array<{
    userId: number
    userName: string
    messageCount: number
  }>
}

export interface RenderTemplateResponse {
  content: string
}

// Filter interfaces
export interface ConversationFilters {
  type?: ConversationType
  isArchived?: boolean
  isMuted?: boolean
  hasUnread?: boolean
  participantId?: number
  search?: string
  empresasId?: number
  page?: number
  limit?: number
}

export interface MessageFilters {
  conversationId?: number
  senderId?: number
  type?: MessageType
  status?: MessageStatus
  search?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface TemplateFilters {
  category?: TemplateCategory
  empresasId?: number
  isPublic?: boolean
  createdBy?: number
}
