import WorkoutDetailPage from "./WorkoutDetailPage"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  // O componente de detalhes lê o ID via useParams no cliente,
  // então não precisamos passar como prop aqui.
  return <WorkoutDetailPage />
}

export async function generateStaticParams() {
  // IDs de exemplo para geração estática opcional
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]
}
