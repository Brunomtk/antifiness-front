import WorkoutDetailPage from "./WorkoutDetailPage"

export async function generateStaticParams() {
  // The actual data fetching will happen at runtime on the client side
  return []
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <WorkoutDetailPage />
}
