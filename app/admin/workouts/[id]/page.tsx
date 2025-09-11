import WorkoutDetailPage from "./WorkoutDetailPage"

export async function generateStaticParams() {
  // Return sample IDs for static generation - these will be the pre-built pages
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]
}

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  const { id } = params
  return <WorkoutDetailPage workoutId={id} />
}
