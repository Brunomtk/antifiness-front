"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, GraduationCap, FileText, Eye, EyeOff } from "lucide-react"
import { useUserContext } from "@/contexts/user-context"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    crn: "",
    specialization: "",
    experience: "",
    city: "",
    state: "",
    bio: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const { register, state } = useUserContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem")
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "admin", // Por padrão, cadastros são de nutricionistas (admin)
      })

      // Se chegou aqui, o cadastro foi bem-sucedido
      alert("Cadastro realizado com sucesso! Faça login para continuar.")
      router.push("/login")
    } catch (error) {
      console.error("Erro no cadastro:", error)
    }
  }

  useEffect(() => {
    if (state.error) {
      alert("Erro no cadastro: " + state.error)
    }
  }, [state.error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-black/5 to-gray-900/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary/5 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-black/3 to-gray-800/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-gradient-to-br from-primary/3 to-pink-600/5 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-black to-gray-800 text-white border-gray-700 hover:from-gray-800 hover:to-black shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          {/* Logo */}
          <div className="bg-gradient-to-br from-black via-gray-900 to-black p-4 rounded-2xl border border-gray-800 shadow-2xl">
            <Image
              src="/logo-antifitness.png"
              alt="AntiFitness Logo"
              width={120}
              height={40}
              className="drop-shadow-lg"
            />
          </div>
          <div className="w-20"></div> {/* Spacer para centralizar logo */}
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/80 border-gray-200 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                Cadastro de Nutricionista
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Junte-se à nossa plataforma e transforme vidas através da nutrição
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Informações Pessoais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Nome Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="pl-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
                        Telefone
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crn" className="text-gray-700 font-medium">
                        CRN
                      </Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="crn"
                          type="text"
                          placeholder="CRN-1 12345"
                          value={formData.crn}
                          onChange={(e) => handleInputChange("crn", e.target.value)}
                          className="pl-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações Profissionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Informações Profissionais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-gray-700 font-medium">
                        Especialização
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("specialization", value)}>
                        <SelectTrigger className="focus:border-black focus:ring-black">
                          <SelectValue placeholder="Selecione sua especialização" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinica">Nutrição Clínica</SelectItem>
                          <SelectItem value="esportiva">Nutrição Esportiva</SelectItem>
                          <SelectItem value="estetica">Nutrição Estética</SelectItem>
                          <SelectItem value="funcional">Nutrição Funcional</SelectItem>
                          <SelectItem value="pediatrica">Nutrição Pediátrica</SelectItem>
                          <SelectItem value="geriatrica">Nutrição Geriátrica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-gray-700 font-medium">
                        Experiência
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("experience", value)}>
                        <SelectTrigger className="focus:border-black focus:ring-black">
                          <SelectValue placeholder="Anos de experiência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 anos</SelectItem>
                          <SelectItem value="2-5">2-5 anos</SelectItem>
                          <SelectItem value="6-10">6-10 anos</SelectItem>
                          <SelectItem value="10+">Mais de 10 anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-gray-700 font-medium">
                        Cidade
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="city"
                          type="text"
                          placeholder="Sua cidade"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="pl-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-700 font-medium">
                        Estado
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger className="focus:border-black focus:ring-black">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          {/* Adicionar outros estados */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700 font-medium">
                      Biografia Profissional
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="bio"
                        placeholder="Conte um pouco sobre sua experiência e abordagem profissional..."
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className="pl-10 min-h-[100px] focus:border-black focus:ring-black transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Segurança</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="pl-10 pr-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="pl-10 pr-10 focus:border-black focus:ring-black transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão de Cadastro */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-pink-600 hover:from-black hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]"
                >
                  Criar Conta
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Já tem uma conta?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:text-black font-semibold transition-colors duration-300"
                  >
                    Faça login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
