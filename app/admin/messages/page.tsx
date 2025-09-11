"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  Send,
  Search,
  Paperclip,
  ImageIcon,
  Smile,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  Clock,
  MessageCircle,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useConversations, useMessages, useUnreadCount } from "@/hooks/use-message"
import { useClients } from "@/hooks/use-client"
import { MessageType, MessageStatus } from "@/types/message"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AdminMessages() {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    loadConversations,
    createConversation,
    isLoading,
  } = useConversations()
  const { messages, sendMessage, loadMessages, isSending } = useMessages()
  const { totalUnread } = useUnreadCount()
  const { clients, fetchClients } = useClients()

  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [conversationsLoaded, setConversationsLoaded] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [showAllUsers, setShowAllUsers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversations and clients on mount
  useEffect(() => {
    if (!conversationsLoaded) {
      Promise.all([loadConversations({ empresasId: 1 }), fetchClients()])
        .then(() => setConversationsLoaded(true))
        .catch(console.error)
    }
  }, [loadConversations, fetchClients, conversationsLoaded])

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

  const getAllUsersForMessaging = () => {
    const existingConversationUserIds = conversations
      .map((conv) => conv.participants.find((p) => p.userId !== 1)?.userId)
      .filter(Boolean)

    const usersWithoutConversations = clients
      .filter((client) => !existingConversationUserIds.includes(client.id))
      .map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        avatar: client.avatar || (client.gender === "M" ? "/man-avatar.png" : "/diverse-woman-avatar.png"),
        isOnline: false, // We don't have real-time status for clients without conversations
        hasConversation: false,
      }))

    const usersWithConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== 1)
      return {
        id: otherParticipant?.userId || 0,
        name: otherParticipant?.userName || "Usuário",
        email: "",
        avatar: "/placeholder.svg",
        isOnline: otherParticipant?.isOnline || false,
        hasConversation: true,
        conversation: conv,
      }
    })

    return [...usersWithConversations, ...usersWithoutConversations]
  }

  const allUsers = getAllUsersForMessaging()
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const displayList = showAllUsers
    ? filteredUsers
    : conversations
        .map((conv) => {
          const otherParticipant = conv.participants.find((p) => p.userId !== 1)
          return {
            id: otherParticipant?.userId || 0,
            name: otherParticipant?.userName || "Usuário",
            email: "",
            avatar: "/placeholder.svg",
            isOnline: otherParticipant?.isOnline || false,
            hasConversation: true,
            conversation: conv,
          }
        })
        .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleStartConversation = useCallback(
    async (clientId: number) => {
      try {
        const existingConversation = conversations.find((conv) => conv.participants.some((p) => p.userId === clientId))

        if (existingConversation) {
          // Direct to existing conversation instead of creating new one
          setCurrentConversation(existingConversation)
          return
        }

        await createConversation({
          empresasId: 1,
          type: 1, // DIRECT
          participantIds: [1, clientId], // Admin ID = 1, Client ID
        })
        // Reload conversations to get the new one
        await loadConversations({ empresasId: 1 })
      } catch (error) {
        console.error("Error creating conversation:", error)
      }
    },
    [createConversation, loadConversations, conversations, setCurrentConversation],
  )

  if (isLoading && !conversationsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-[calc(100vh-120px)] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#df0e67] mx-auto mb-4"></div>
              <p>Carregando mensagens...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Mensagens</h1>
                <p className="text-white/80">Gerencie conversas e comunicação com clientes</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant={showAllUsers ? "default" : "outline"}
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className={
                    showAllUsers
                      ? "bg-white text-pink-600 hover:bg-gray-100"
                      : "bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  }
                >
                  {showAllUsers ? "Conversas" : "Todos Usuários"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Conversas</p>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Não Lidas</p>
                  <p className="text-2xl font-bold">{totalUnread}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Clientes Ativos</p>
                  <p className="text-2xl font-bold">
                    {conversations.filter((c) => c.participants.some((p) => p.isOnline)).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Taxa Resposta</p>
                  <p className="text-2xl font-bold">98%</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="h-[calc(100vh-400px)] flex bg-white">
            {/* Lista de Conversas */}
            <div className="w-80 border-r flex flex-col bg-gray-50">
              {/* Header da Lista */}
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
                  <Badge variant="secondary" className="bg-[#df0e67]/10 text-[#df0e67] font-medium">
                    {totalUnread} novas
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={showAllUsers ? "Buscar usuários..." : "Buscar conversas..."}
                    className="pl-10 h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Lista de Conversas/Usuários */}
              <ScrollArea className="flex-1">
                <div className="p-3">
                  {displayList.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                        currentConversation?.id === user.conversation?.id
                          ? "bg-gradient-to-r from-[#df0e67]/10 to-pink-100 border border-[#df0e67]/20 shadow-sm"
                          : "hover:bg-white hover:shadow-sm"
                      }`}
                      onClick={() => {
                        if (user.hasConversation && user.conversation) {
                          setCurrentConversation(user.conversation)
                        } else {
                          handleStartConversation(user.id)
                        }
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                            user.isOnline,
                          )} shadow-sm`}
                        />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          {user.hasConversation && user.conversation?.lastMessage && (
                            <p className="text-xs text-gray-500">
                              {formatConversationTime(user.conversation.lastMessage.createdAt)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {user.hasConversation
                            ? user.conversation?.lastMessage?.content || "Sem mensagens"
                            : "Clique para iniciar conversa"}
                        </p>
                      </div>
                      {user.hasConversation && user.conversation && user.conversation.unreadCount > 0 && (
                        <Badge className="ml-2 bg-[#df0e67] hover:bg-[#df0e67] shadow-sm">
                          {user.conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Área de Chat */}
            <div className="flex-1 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Header do Chat */}
                  <div className="p-6 border-b bg-white flex items-center justify-between">
                    <div className="flex items-center">
                      {(() => {
                        const otherParticipant = currentConversation.participants.find((p) => p.userId !== 1)
                        return (
                          <>
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-gray-200">
                                <AvatarImage src="/placeholder.svg" alt={otherParticipant?.userName || "Usuário"} />
                                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-medium">
                                  {otherParticipant?.userName?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                  otherParticipant?.isOnline || false,
                                )} shadow-sm`}
                              />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {otherParticipant?.userName || "Usuário"}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">
                                {otherParticipant?.isOnline ? "online" : "offline"}
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-gray-100">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-gray-100">
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-gray-100">
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
                  <ScrollArea className="flex-1 p-6 bg-gray-50">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 1 ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                              message.senderId === 1
                                ? "bg-gradient-to-r from-[#df0e67] to-pink-600 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div
                              className={`mt-2 flex items-center justify-end gap-1 text-xs ${
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
                  <div className="p-6 border-t bg-white">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
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
                          className="h-12 border-gray-200 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="h-12 w-12 rounded-xl bg-gradient-to-r from-[#df0e67] to-pink-600 hover:from-[#c00c5a] hover:to-pink-700 shadow-lg"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Pressione Enter para enviar, Shift+Enter para nova linha
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">Selecione uma conversa</p>
                    <p className="text-sm">Escolha uma conversa da lista para começar a conversar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
