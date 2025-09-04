"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Heart,
  Users,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Leaf,
  ArrowRight,
  Star,
  Zap,
  Target,
  Award,
  TrendingUp,
  Shield,
  LogIn,
} from "lucide-react"
import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen isLoading={true} text="Bem-vindo ao Anti-Fitness" />
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-antifitness.png" alt="Anti-Fitness Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#df0e67] to-[#c00c5a] bg-clip-text text-transparent">
                Anti-Fitness
              </span>
            </div>

            {/* Login Button */}
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 bg-transparent"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gray-800 to-black rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse-slow"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid max-w-7xl mx-auto gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left Content */}
            <div
              className={`space-y-8 text-center lg:text-left transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
                  <Zap className="w-4 h-4" />
                  Transformação Real, Resultados Duradouros
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-black via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    SUA JORNADA
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    ANTI-FITNESS
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-black via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    COMEÇA AQUI
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                  Esqueça as dietas restritivas e os treinos extremos.
                  <span className="font-semibold text-pink-600"> Nossa abordagem revolucionária </span>
                  foca no equilíbrio, prazer e sustentabilidade para uma vida mais saudável.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">500+</div>
                  <div className="text-sm text-gray-600">Clientes Transformados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">98%</div>
                  <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black">5★</div>
                  <div className="text-sm text-gray-600">Avaliação Média</div>
                </div>
              </div>
            </div>

            {/* Right Content - Logo and Visual Elements */}
            <div
              className={`relative flex items-center justify-center transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="relative">
                {/* Animated Rings */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 animate-ping opacity-30"></div>
                <div
                  className="absolute inset-4 rounded-full border-4 border-pink-200 animate-ping opacity-40"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute inset-8 rounded-full border-4 border-black/20 animate-ping opacity-50"
                  style={{ animationDelay: "2s" }}
                ></div>

                {/* Logo Container - Now with black background */}
                <div className="relative w-80 h-80 lg:w-96 lg:h-96 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black rounded-full shadow-2xl border-4 border-gray-800">
                  <img
                    src="/logo-antifitness.png"
                    alt="Anti-Fitness Logo"
                    className="w-64 h-64 lg:w-80 lg:h-80 object-contain animate-pulse-slow drop-shadow-2xl"
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-black to-gray-800 text-white p-3 rounded-full shadow-lg animate-bounce">
                  <Heart className="w-6 h-6" />
                </div>
                <div
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  <Target className="w-6 h-6" />
                </div>
                <div
                  className="absolute top-1/2 -right-8 bg-gradient-to-r from-gray-800 to-black text-white p-2 rounded-full shadow-lg animate-bounce"
                  style={{ animationDelay: "2s" }}
                >
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-black rounded-full flex justify-center">
            <div className="w-1 h-3 bg-black rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-black md:text-4xl">SOBRE MIM</h2>
          <div className="space-y-6 text-gray-700">
            <p className="text-lg leading-relaxed">
              Sou nutricionista formado por uma das melhores universidades do país, e minha paixão pela alimentação vai
              além dos nutrientes. Acredito que a comida tem um poder transformador, não apenas no corpo, mas também nas
              nossas relações sociais. Para mim, a verdadeira nutrição é aquela baseada em alimentos reais, que
              respeitam a individualidade e estão conectados ao contexto social de cada pessoa.
            </p>
            <p className="text-lg leading-relaxed">
              Como seu nutricionista, minha missão não é restringir, mas sim adequar sua alimentação, oferecendo as
              ferramentas para que você se sinta no controle da sua saúde. Vou te ensinar a comer de forma mais
              consciente, equilibrada e autônoma, para que você conquiste uma vida mais saudável, sem abrir mão do
              prazer de comer bem.
            </p>
            <p className="text-right text-lg font-medium italic text-[#df0e67]">Julio</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
                Por que
              </span>
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Anti-Fitness?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa metodologia revolucionária quebra os paradigmas tradicionais do fitness, focando no que realmente
              importa: seu bem-estar integral.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Abordagem Humanizada",
                description:
                  "Cada pessoa é única. Criamos planos personalizados que respeitam sua individualidade e estilo de vida.",
                color: "from-black to-gray-800",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Sem Restrições Extremas",
                description:
                  "Nada de dietas malucas ou treinos impossíveis. Foco no equilíbrio e sustentabilidade a longo prazo.",
                color: "from-pink-500 to-purple-600",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Resultados Duradouros",
                description:
                  "Mudanças graduais e consistentes que se tornam hábitos permanentes para uma vida mais saudável.",
                color: "from-gray-800 to-black",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Suporte Contínuo",
                description:
                  "Acompanhamento personalizado com nossa equipe especializada via WhatsApp e consultas regulares.",
                color: "from-pink-600 to-rose-500",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Método Comprovado",
                description:
                  "Mais de 500 clientes transformados com nossa metodologia baseada em evidências científicas.",
                color: "from-black to-gray-700",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Objetivos Realistas",
                description:
                  "Metas alcançáveis que respeitam seu ritmo e suas limitações, garantindo motivação constante.",
                color: "from-purple-600 to-pink-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-black md:text-4xl">SERVIÇOS</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-black to-gray-800 group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-black">PLANO ALIMENTAR PERSONALIZADO</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Durante a consulta, passamos por todo seu dia e os sentimentos atrelados a cada refeição, para assim
                  melhorar o que já é realizado. Isso funciona para você ter adesão e resultados duradouros.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 group-hover:from-black group-hover:to-gray-800 transition-all duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-black">AVALIAÇÃO DA COMPOSIÇÃO CORPORAL</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Durante o acompanhamento, vou monitorar de perto as alterações da composição corporal, assim como os
                  exames bioquímicos, para que minha conduta seja ainda mais acertiva e adequada para você. E isso
                  também vale para o on-line.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-gray-800 to-black group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-black">ACOMPANHAMENTO VIA WHATSAPP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Estou no whatsApp durante todo o dia, para te auxiliar e estar perto do seu processo. Quero acompanhar
                  de perto suas vitórias, mas também lhe aconselhar para fora do consultório nos momentos mais difíceis
                  e mais desafiadores da alimentação.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 group-hover:from-black group-hover:to-gray-800 transition-all duration-300">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-black">ACESSO A MATERIAIS EXCLUSIVOS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Conteúdos apenas para clientes, onde direciono sobre refeições fora de casa, comer com atenção plena,
                  fome emocional, lista de compras, receitas incríveis... Isso será um aliado para chegar no seu
                  objetivo, de forma mais prática e rápida.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="agendar" className="bg-gradient-to-br from-gray-50 to-white px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-black md:text-4xl">
            Escolha o plano ideal para sua jornada!
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-gray-600">
            Cada pessoa tem um ritmo e uma necessidade diferente. Escolha o plano que melhor se adapta a você e tenha um
            acompanhamento nutricional completo e personalizado.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-black">PLANO ESSENCIAL</CardTitle>
                <CardDescription>(Consulta avulsa)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Atendimento único e personalizado.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Avaliação completa do seu perfil alimentar e de saúde.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Plano alimentar individualizado.</span>
                  </li>
                </ul>
                <div className="pt-4 text-center">
                  <p className="text-lg font-bold text-black">Valor: R$ 250,00</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white">
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white/90 backdrop-blur-sm">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-[#df0e67] to-pink-500 px-4 py-1 text-sm font-medium text-white">
                Mais Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-black">PLANO EVOLUÇÃO</CardTitle>
                <CardDescription>(Acompanhamento trimestral - 3 consultas)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Acompanhamento para ajustes e evolução do plano alimentar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Estratégias personalizadas para sua rotina.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Suporte para leitura de rótulos e planejamento de refeições.</span>
                  </li>
                </ul>
                <div className="pt-4 text-center">
                  <p className="text-lg font-bold text-black">Valor: R$ 230,00 mensal</p>
                  <p className="text-sm text-gray-500">(Total: R$ 540,00)</p>
                </div>
                <Button className="w-full bg-[#df0e67] hover:bg-[#b00950]">Agendar Consulta</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-black">PLANO TRANSFORMAÇÃO</CardTitle>
                <CardDescription>(Acompanhamento semestral - 6 consultas)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Acompanhamento contínuo para resultados sólidos e duradouros.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Ajustes periódicos no plano alimentar conforme sua evolução.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-[#df0e67]" />
                    <span>Suporte exclusivo entre consultas para dúvidas.</span>
                  </li>
                </ul>
                <div className="pt-4 text-center">
                  <p className="text-lg font-bold text-black">Valor: R$ 200,00 mensal</p>
                  <p className="text-sm text-gray-500">(Total: R$ 960,00)</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-800 text-white">
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 rounded-lg bg-gradient-to-r from-black via-gray-900 to-black p-8 shadow-2xl">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Pronto para começar sua transformação?</h3>
              <p className="text-white/90 mb-6">
                Entre em contato conosco e descubra como podemos ajudar você a alcançar seus objetivos de forma saudável
                e sustentável.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold">
                  <Link href="/admin/dashboard">
                    Portal do Nutricionista
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold bg-transparent"
                >
                  <Link href="/client/dashboard">
                    Portal do Cliente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-black md:text-4xl">
              NUTRICIONISTA JULIO
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-5 w-5 text-black" />
                <span>(11) 98765-4321</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-black" />
                <span>São Paulo, SP</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Instagram className="h-5 w-5 text-[#df0e67]" />
                <span>@julionutricionista</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-5 w-5 text-black" />
                <span>julio@nutricao.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-antifitness.png" alt="Anti-Fitness Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold">Anti-Fitness</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Revolucionando a forma como as pessoas se relacionam com a alimentação e o bem-estar, através de uma
                abordagem científica e humanizada.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: "📧", label: "contato@antifitness.com" },
                  { icon: "📱", label: "(11) 99999-9999" },
                ].map((contact, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{contact.icon}</span>
                    <span>{contact.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/admin/login" className="hover:text-white transition-colors">
                    Portal Nutricionista
                  </Link>
                </li>
                <li>
                  <Link href="/client/dashboard" className="hover:text-white transition-colors">
                    Portal Cliente
                  </Link>
                </li>
                <li>
                  <a href="#sobre" className="hover:text-white transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#agendar" className="hover:text-white transition-colors">
                    Planos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Anti-Fitness. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
