import ClientDetailsPage from "./ClientDetailsPage"

export async function generateStaticParams() {
  // Return sample parameters for static generation
  // In a real app, you would fetch actual client IDs from your data source
  return [{ id: "1" }, { id: "2" }, { id: "3" }]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <ClientDetailsPage />
}
