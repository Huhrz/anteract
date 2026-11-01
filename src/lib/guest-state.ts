import type { SharedEvent } from "../components/event-provider";
import type { Profile } from "./profile";

export const guestUserId = "guest-student";
export const guestStorageKey = "anteract-guest-v1";
export type GuestProfile = Profile & { photoUrl: string };
export type GuestRequest = { id: string; sender_id: string; recipient_id: string; status: "pending" | "accepted" | "rejected"; created_at: string };
export type GuestState = { version: 1; events: SharedEvent[]; profile: GuestProfile; requests: GuestRequest[] };
export type GuestAction =
  | { type: "create"; event: SharedEvent }
  | { type: "join" | "leave" | "cancel"; eventId: string }
  | { type: "profile"; profile: GuestProfile }
  | { type: "invite"; request: GuestRequest }
  | { type: "respond"; requestId: string; accept: boolean };

export function guestReducer(state: GuestState, action: GuestAction): GuestState {
  if (action.type === "profile") return { ...state, profile: action.profile, events: state.events.map((event) => event.isHost ? { ...event, hostName: action.profile.display_name } : event) };
  if (action.type === "create") return { ...state, events: [...state.events, action.event] };
  if (action.type === "invite") {
    if (action.request.recipient_id === guestUserId) throw new Error("You cannot add yourself.");
    if (state.requests.some((request) => request.status !== "rejected" && [request.sender_id, request.recipient_id].includes(action.request.recipient_id))) throw new Error("You already have a request or connection with this student.");
    return { ...state, requests: [...state.requests, action.request] };
  }
  if (action.type === "respond") {
    const request = state.requests.find((item) => item.id === action.requestId);
    if (!request || request.recipient_id !== guestUserId || request.status !== "pending") throw new Error("This invitation is no longer pending.");
    return { ...state, requests: state.requests.map((item) => item.id === request.id ? { ...item, status: action.accept ? "accepted" : "rejected" } : item) };
  }
  const event = state.events.find((item) => item.id === action.eventId);
  if (!event) throw new Error("This event is no longer available.");
  if (action.type === "cancel") {
    if (!event.isHost) throw new Error("Only the host can cancel this event.");
    return { ...state, events: state.events.filter((item) => item.id !== event.id) };
  }
  if (event.isHost) throw new Error("Hosts are already part of their event.");
  if (action.type === "join" && !event.isJoined && event.participants >= event.capacity) throw new Error("This event is full.");
  if (action.type === "join" && Date.parse(event.startsAt) <= Date.now()) throw new Error("This event has already started.");
  const joining = action.type === "join";
  if (event.isJoined === joining) return state;
  return { ...state, events: state.events.map((item) => item.id === event.id ? {
    ...item, isJoined: joining, participants: item.participants + (joining ? 1 : -1),
    attendeeIds: joining ? [...item.attendeeIds, guestUserId] : item.attendeeIds.filter((id) => id !== guestUserId),
  } : item) };
}

export function readGuestState(raw: string | null, fallback: GuestState): GuestState {
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw) as GuestState;
    if (data.version !== 1 || !Array.isArray(data.events) || !Array.isArray(data.requests) || data.profile?.id !== guestUserId || typeof data.profile.display_name !== "string" || !Array.isArray(data.profile.interests)) return fallback;
    if (data.events.some((event) => !event || typeof event.id !== "string" || typeof event.title !== "string" || !Number.isFinite(Date.parse(event.startsAt)) || !Array.isArray(event.attendeeIds) || !Array.isArray(event.tags) || !Number.isInteger(event.participants) || !Number.isInteger(event.capacity) || event.participants < 1 || event.participants > event.capacity || typeof event.isJoined !== "boolean" || typeof event.isHost !== "boolean")) return fallback;
    if (data.requests.some((request) => !request || typeof request.id !== "string" || typeof request.sender_id !== "string" || typeof request.recipient_id !== "string" || !["pending", "accepted", "rejected"].includes(request.status))) return fallback;
    return data;
  } catch { return fallback; }
}
