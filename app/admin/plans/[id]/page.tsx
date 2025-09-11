import PlanEditPage from "./PlanEditPage"

export async function generateStaticParams() {
  // Return at least one valid ID for static generation
  return [{ id: "1" }, { id: "2" }, { id: "3" }]
}

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  const { id } = params
  return <PlanEditPage planId={id} />
}
