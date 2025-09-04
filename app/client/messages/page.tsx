"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, ImageIcon, CheckCheck } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import NotificationDropdown from "@/components/notification-dropdown"
import { useConversations, useMessages } from "@/hooks/use-message"
import { MessageType, MessageStatus } from "@/types/message"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ClientMessages() {
  const isMobile = useMobile()
  const { conversations, currentConversation, setCurrentConversation, loadConversations, isLoading } =
    useConversations()
  const { messages, sendMessage, loadMessages, isSending } = useMessages()
  const [newMessage, setNewMessage] = useState("")
  const [conversationsLoaded, setConversationsLoaded] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)

  // Load conversations only once on mount
  useEffect(() => {
    if (!conversationsLoaded) {
      loadConversations({ empresasId: 1 }) // Replace with actual empresasId
        .then(() => setConversationsLoaded(true))
        .catch(console.error)
    }
  }, [loadConversations, conversationsLoaded])

  // Set first conversation as current if none selected
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation && conversationsLoaded) {
      setCurrentConversation(conversations[0])
    }
  }, [conversations, currentConversation, setCurrentConversation, conversationsLoaded])

  // Load messages when conversation changes (only if different)
  useEffect(() => {
    if (currentConversation && currentConversation.id !== currentConversationId) {
      setCurrentConversationId(currentConversation.id)
      loadMessages(currentConversation.id).catch(console.error)
    }
  }, [currentConversation, loadMessages, currentConversationId])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentConversation) return

    try {
      const currentUserId = 2 // Replace with actual client user ID
      const nutritionistId = currentConversation.participants.find((p) => p.userId !== currentUserId)?.userId || 1

      await sendMessage({
        conversationId: currentConversation.id,
        senderId: currentUserId,
        receiverId: nutritionistId,
        type: MessageType.TEXT,
        content: newMessage,
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }, [newMessage, currentConversation, sendMessage])

  const formatMessageTime = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return `Hoje, ${format(date, "HH:mm", { locale: ptBR })}`
    } else {
      return format(date, "dd/MM/yyyy, HH:mm", { locale: ptBR })
    }
  }, [])

  if (isLoading && !conversationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#df0e67] mx-auto mb-4"></div>
              <p>Carregando mensagens...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentConversation && conversationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-4 md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-3xl">Mensagens</h1>
              <p className="text-xs text-gray-600 md:text-base">
                Comunique-se diretamente com seu nutricionista para tirar dúvidas e receber orientações.
              </p>
            </div>
            {!isMobile && <NotificationDropdown />}
          </div>
          <Card className="border-none shadow-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">Nenhuma conversa encontrada</p>
                <p className="text-sm">Você ainda não possui conversas com seu nutricionista</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const nutritionist = currentConversation?.participants.find((p) => p.userId !== 2) // Replace with actual client ID

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-3xl">Mensagens</h1>
            <p className="text-xs text-gray-600 md:text-base">
              Comunique-se diretamente com seu nutricionista para tirar dúvidas e receber orientações.
            </p>
          </div>
          {!isMobile && <NotificationDropdown />}
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/professional-nutritionist.png" alt={nutritionist?.userName || "Nutricionista"} />
                <AvatarFallback>{nutritionist?.userName?.substring(0, 2).toUpperCase() || "N"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{nutritionist?.userName || "Nutricionista"}</CardTitle>
                <p className="text-sm text-muted-foreground">Nutricionista</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Ver perfil
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex h-[calc(100vh-200px)] md:h-[calc(100vh-280px)] flex-col justify-between p-3 md:p-4">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 2 ? "justify-end" : "justify-start"}`} // Replace 2 with actual client ID
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.senderId === 2 ? "bg-[#df0e67] text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                          message.senderId === 2 ? "text-pink-100" : "text-gray-500"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {message.senderId === 2 && message.status === MessageStatus.READ && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="min-h-[60px] md:min-h-[80px] resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-gray-500">
                      Pressione Enter para enviar, Shift+Enter para nova linha
                    </span>
                  </div>
                </div>
                <Button
                  className="h-12 min-w-[48px] bg-[#df0e67] hover:bg-[#c00c5a]"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
