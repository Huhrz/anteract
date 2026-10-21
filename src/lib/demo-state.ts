import { hangouts, people } from "./hangouts";

export type Attendance = "joined" | "confirmed" | "arrived";
export type Message = { id: string; text: string; sentAt: string };
export const reportReasons = ["Harassment or bullying", "Hate or discrimination", "Threats or violence", "Sexual misconduct", "Spam or scam", "Other"] as const;
export type AccountReport = { id: string; personId: string; reason: typeof reportReasons[number]; details: string; createdAt: string };
export type DemoState = {
  blockedAccounts: string[];
  reports: AccountReport[];
  memberships: Record<string, Attendance>;
  conversations: Record<string, Message[]>;
};
export type DemoAction =
  | { type: "join" | "leave" | "confirm" | "arrive"; eventId: string }
  | { type: "message"; personId: string; message: Message }
  | { type: "block" | "unblock"; personId: string }
  | { type: "report"; report: AccountReport; block: boolean }
  | { type: "hydrate"; state: DemoState };

export const storageKey = "anteract-demo-v1";
export const emptyState: DemoState = { memberships: {}, conversations: {}, blockedAccounts: [], reports: [] };

// Backend integration point. The server must enforce membership and capacity.
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "hydrate") return action.state;
  if (action.type === "block" || action.type === "unblock") {
    if (!people.some((person) => person.id === action.personId)) return state;
    const blockedAccounts = state.blockedAccounts.filter((id) => id !== action.personId);
    if (action.type === "block") blockedAccounts.push(action.personId);
    return { ...state, blockedAccounts };
  }
  if (action.type === "report") {
    if (!validReport(action.report) || state.reports.some((report) => report.id === action.report.id)) return state;
    return { ...state, reports: [...state.reports, { ...action.report, details: action.report.details.trim() }],
      blockedAccounts: action.block ? [...new Set([...state.blockedAccounts, action.report.personId])] : state.blockedAccounts };
  }
  if (action.type === "message") {
    if (state.blockedAccounts.includes(action.personId) || !people.some((person) => person.id === action.personId) || !action.message.text.trim() || action.message.text.length > 1000) return state;
    return { ...state, conversations: { ...state.conversations, [action.personId]: [...(state.conversations[action.personId] ?? []), action.message] } };
  }
  if (!("eventId" in action)) return state;
  const event = hangouts.find((item) => item.id === action.eventId);
  if (!event) return state;
  const current = state.memberships[action.eventId];
  const memberships = { ...state.memberships };
  if (action.type === "join") {
    if (current || event.participants >= event.capacity) return state;
    memberships[action.eventId] = "joined";
  } else if (action.type === "leave") {
    delete memberships[action.eventId];
  } else if (action.type === "confirm") {
    if (current !== "joined") return state;
    memberships[action.eventId] = "confirmed";
  } else if (action.type === "arrive") {
    if (current !== "confirmed") return state;
    memberships[action.eventId] = "arrived";
  }
  return { ...state, memberships };
}

function validReport(value: unknown): value is AccountReport {
  if (!value || typeof value !== "object") return false;
  const report = value as AccountReport;
  return typeof report.id === "string" && Boolean(report.id) && people.some((person) => person.id === report.personId)
    && reportReasons.includes(report.reason) && typeof report.details === "string" && report.details.length <= 2000
    && typeof report.createdAt === "string" && Number.isFinite(Date.parse(report.createdAt));
}

// Ignore stale/malformed browser data and unknown event/profile IDs.
export function readDemoState(value: string | null): DemoState {
  const clean: DemoState = { memberships: {}, conversations: {}, blockedAccounts: [], reports: [] };
  if (!value) return clean;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== "object") return clean;
    const saved = data as Record<string, unknown>;
    if (Array.isArray(saved.blockedAccounts)) clean.blockedAccounts = people.filter((person) => (saved.blockedAccounts as unknown[]).includes(person.id)).map((person) => person.id);
    if (Array.isArray(saved.reports)) clean.reports = saved.reports.filter(validReport).filter((report, index, reports) => reports.findIndex((item) => item.id === report.id) === index);
    if (saved.memberships && typeof saved.memberships === "object") {
      for (const event of hangouts) {
        const status = (saved.memberships as Record<string, unknown>)[event.id];
        if (status === "joined" || status === "confirmed" || status === "arrived") clean.memberships[event.id] = status;
      }
    }
    if (saved.conversations && typeof saved.conversations === "object") {
      for (const person of people) {
        const messages = (saved.conversations as Record<string, unknown>)[person.id];
        if (!Array.isArray(messages)) continue;
        clean.conversations[person.id] = messages.filter((item): item is Message => Boolean(item && typeof item === "object" && typeof item.id === "string" && typeof item.text === "string" && item.text.trim() && item.text.length <= 1000 && typeof item.sentAt === "string" && Number.isFinite(Date.parse(item.sentAt))));
      }
    }
  } catch { /* A malformed demo save starts with an empty agenda. */ }
  return clean;
}
