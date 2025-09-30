import ClientFeedbackDetailsPage from "./ClientFeedbackDetailsPage"

export async function generateStaticParams() {
  // Return at least one valid parameter for static export compatibility
  return [{ id: "1" }, { id: "2" }, { id: "3" }]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <ClientFeedbackDetailsPage feedbackId={id} />
}
