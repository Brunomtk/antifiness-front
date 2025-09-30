import DietDetailsPage from "./DietDetailsPage"

export async function generateStaticParams() {
  // Return multiple valid parameter sets for static export
  // This ensures Next.js can generate static pages for common diet IDs
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
    { id: "7" },
    { id: "8" },
    { id: "9" },
    { id: "10" },
  ]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <DietDetailsPage dietId={id} />
}
