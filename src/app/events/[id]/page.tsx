import { notFound } from "next/navigation";
import { hangouts } from "@/lib/hangouts";
import { EventDetails } from "@/components/event-details";

export function generateStaticParams() { return hangouts.map((event) => ({ id: event.id })); }

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = hangouts.find((item) => item.id === id);
  if (!event) notFound();
  return <EventDetails event={event} />;
}
