import type { Category } from "./hangouts";

export type EventFilters = {
  category: Category;
  query: string;
  tags: string[];
  when: "upcoming" | "today" | "week";
  spotsOnly: boolean;
};

export const defaultEventFilters: EventFilters = { category: "All", query: "", tags: [], when: "upcoming", spotsOnly: false };

type FilterableEvent = {
  category: string; title: string; location: string; description: string;
  tags?: readonly string[]; startsAt: string; participants: number; capacity: number;
};

export function filterEvents<T extends FilterableEvent>(events: readonly T[], filters: EventFilters, now = new Date()): T[] {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  if (filters.when === "week") end.setDate(end.getDate() + 6);
  const query = filters.query.trim().toLowerCase().replace(/^#/, "");
  return events.filter((event) => {
    const start = new Date(event.startsAt).getTime();
    if (!Number.isFinite(start) || start <= now.getTime()) return false;
    if (filters.when !== "upcoming" && start >= end.getTime()) return false;
    if (filters.category !== "All" && event.category !== filters.category) return false;
    if (filters.spotsOnly && event.participants >= event.capacity) return false;
    const tags = event.tags ?? [];
    if (!filters.tags.every((tag) => tags.includes(tag))) return false;
    return `${event.title} ${event.location} ${event.description} ${tags.join(" ")}`.toLowerCase().includes(query);
  }).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
