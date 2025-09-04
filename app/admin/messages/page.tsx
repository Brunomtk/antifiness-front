"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Search, Paperclip, ImageIcon, Smile, MoreVertical, Phone, Video, CheckCheck, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useConversations, useMessages, useUnreadCount } from "@/hooks/use-message"
import { MessageType, MessageStatus } from "@/types/message"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AdminMessages() {
  const { conversations, currentConversation, setCurrentConversation, loadConversations, isLoading } =
    useConversations()
  const { messages, sendMessage, loadMessages, isSending } = useMessages()
  const { totalUnread } = useUnreadCount()

  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [conversationsLoaded, setConversationsLoaded] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversations only once on mount
  useEffect(() => {
    if (!conversationsLoaded) {
      loadConversations({ empresasId: 1 }) // Replace with actual empresasId
        .then(() => setConversationsLoaded(true))
        .catch(console.error)
    }
  }, [loadConversations, conversationsLoaded])

  // Load messages when conversation changes (only if different)
  useEffect(() => {
    if (currentConversation && currentConversation.id !== currentConversationId) {
      setCurrentConversationId(currentConversation.id)
      loadMessages(currentConversation.id).catch(console.error)
    }
  }, [currentConversation, loadMessages, currentConversationId])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentConversation) return

    try {
      await sendMessage({
        conversationId: currentConversation.id,
        senderId: 1, // Replace with actual admin user ID
        receiverId: currentConversation.participants.find((p) => p.userId !== 1)?.userId || 1,
        type: MessageType.TEXT,
        content: newMessage,
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }, [newMessage, currentConversation, sendMessage])

  const getStatusIcon = useCallback((status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENT:
        return <Clock className="h-3 w-3 text-gray-400" />
      case MessageStatus.DELIVERED:
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case MessageStatus.READ:
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }, [])

  const getStatusColor = useCallback((isOnline: boolean) => {
    return isOnline ? "bg-green-500" : "bg-gray-400"
  }, [])

  const formatMessageTime = useCallback((dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: ptBR })
  }, [])

  const formatConversationTime = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, "HH:mm", { locale: ptBR })
    } else {
      return format(date, "dd/MM", { locale: ptBR })
    }
  }, [])

  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) => p.userName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading && !conversationsLoaded) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#df0e67] mx-auto mb-4"></div>
          <p>Carregando mensagens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg shadow-sm border">
      {/* Lista de Conversas */}
      <div className="w-80 border-r flex flex-col">
        {/* Header da Lista */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mensagens</h2>
            <Badge variant="secondary" className="bg-[#df0e67]/10 text-[#df0e67]">
              {totalUnread} novas
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find((p) => p.userId !== 1) // Replace with actual admin ID

              return (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversation?.id === conversation.id
                      ? "bg-[#df0e67]/10 border border-[#df0e67]/20"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentConversation(conversation)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt={otherParticipant?.userName || "Usuário"} />
                      <AvatarFallback>
                        {otherParticipant?.userName?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                        otherParticipant?.isOnline || false,
                      )}`}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {otherParticipant?.userName || "Usuário"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conversation.lastMessage ? formatConversationTime(conversation.lastMessage.createdAt) : ""}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content || "Sem mensagens"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-2 bg-[#df0e67] hover:bg-[#df0e67]">{conversation.unreadCount}</Badge>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                {(() => {
                  const otherParticipant = currentConversation.participants.find((p) => p.userId !== 1)
                  return (
                    <>
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" alt={otherParticipant?.userName || "Usuário"} />
                          <AvatarFallback>
                            {otherParticipant?.userName?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                            otherParticipant?.isOnline || false,
                          )}`}
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">{otherParticipant?.userName || "Usuário"}</h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {otherParticipant?.isOnline ? "online" : "offline"}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                    <DropdownMenuItem>Histórico de consultas</DropdownMenuItem>
                    <DropdownMenuItem>Plano atual</DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="text-red-600">Bloquear cliente</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderId === 1 ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === 1 ? "bg-[#df0e67] text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                          message.senderId === 1 ? "text-pink-100" : "text-gray-500"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {message.senderId === 1 && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-[#df0e67] hover:bg-[#c00c5a]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Pressione Enter para enviar, Shift+Enter para nova linha</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa da lista para começar a conversar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
