"use client"

import { Wifi, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Wifi className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl text-gray-900">Você está offline</CardTitle>
          <CardDescription className="text-gray-600">
            Verifique sua conexão com a internet e tente novamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 space-y-2">
            <p>• Algumas funcionalidades podem estar limitadas</p>
            <p>• Seus dados serão sincronizados quando voltar online</p>
            <p>• Você ainda pode navegar pelas páginas em cache</p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => window.location.reload()} className="bg-[#df0e67] hover:bg-[#df0e67]/90 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>

            <Button variant="outline" asChild>
              <Link href="/client/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
