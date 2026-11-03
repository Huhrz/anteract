export const messageLimit = 1000;
export const historyPageSize = 50;
export type DirectMessage = { id: string; conversation_id: string; sender_id: string; content: string; created_at: string };
export type DirectConversation = { id: string; recipient_id: string; display_name: string; avatar_path: string | null; photoUrl?: string; last_content: string | null; last_sender_id: string | null; last_created_at: string | null; created_at: string };

// Realtime and REST can use different ISO offsets/precision. Compare instants
// while preserving Postgres microseconds beyond the precision of JS Date.
export function compareTimestamps(a: string, b: string) {
  const fraction = (value: string) => Number((value.match(/\.(\d+)/)?.[1] ?? "").padEnd(6, "0").slice(3, 6));
  return Date.parse(a) - Date.parse(b) || fraction(a) - fraction(b);
}
export function compareMessages(a: DirectMessage, b: DirectMessage) {
  return compareTimestamps(a.created_at, b.created_at) || a.id.localeCompare(b.id);
}
export function sortConversations(items: DirectConversation[]) {
  return [...items].sort((a, b) => compareTimestamps(b.last_created_at ?? b.created_at, a.last_created_at ?? a.created_at) || a.id.localeCompare(b.id));
}
export function mergeMessages(current: DirectMessage[], incoming: DirectMessage[]) {
  return [...new Map([...current, ...incoming].map(message => [message.id, message])).values()].sort(compareMessages);
}
export function validMessage(content: string) {
  return !!content.trim() && Array.from(content).length <= messageLimit;
}
export function messagingError(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    if (["42P01", "42883", "PGRST202", "PGRST205"].includes(String(error.code))) return "Messaging setup is incomplete. Please apply the direct messaging migration.";
    if (error.code === "42501") return "This conversation is unavailable. Only accepted friends can send messages.";
  }
  return error instanceof Error ? error.message : "Could not connect to messages. Please try again.";
}
