import { notFound } from "next/navigation";
import { people } from "@/lib/hangouts";
import { ChatScreen } from "@/components/chat-screen";

export function generateStaticParams() { return people.map((person) => ({ id: person.id })); }

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  return <ChatScreen person={person} />;
}
