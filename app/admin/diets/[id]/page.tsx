import DietDetailsPage from "./DietDetailsPage"

export async function generateStaticParams() {
  // Return at least one valid parameter set for static export
  return [{ id: "1" }, { id: "2" }, { id: "3" }]
}

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  const { id } = params
  return <DietDetailsPage dietId={id} />
}
