"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { hangouts, people } from "@/lib/hangouts";
import { guestModeEnabled } from "@/lib/guest-mode";
import { guestReducer, guestStorageKey, guestUserId, readGuestState, type GuestAction, type GuestState } from "@/lib/guest-state";

function initialState(): GuestState {
  const now = new Date().toISOString();
  const tags = [["finals", "coffee", "beginner-friendly"], ["coffee", "first-years"], ["outdoors", "beginner-friendly"]];
  return {
    version: 1,
    profile: { id: guestUserId, display_name: "Guest Student", major: "Informatics", class_year: "Third year", interests: ["Coffee", "Study sessions"], avatar_path: null, photoUrl: "" },
    events: hangouts.map((event, index) => {
      const date = new Date(); date.setDate(date.getDate() + index + 1); date.setHours(index === 1 ? 18 : 16, 0, 0, 0);
      return { ...event, startsAt: date.toISOString(), tags: tags[index], time: date.toLocaleString(), hostName: people.find((person) => person.id === event.hostId)?.name ?? "Sample host", attendeeIds: event.attendeeIds.filter((id) => id !== event.hostId), isHost: false, isJoined: false };
    }),
    requests: [
      { id: "sample-incoming", sender_id: "sam", recipient_id: guestUserId, status: "pending", created_at: now },
      { id: "sample-friend", sender_id: guestUserId, recipient_id: "alex", status: "accepted", created_at: now },
    ],
  };
}

type GuestContextValue = { state: GuestState; ready: boolean; storageError: boolean; act: (action: GuestAction) => void; reset: () => void };
const GuestContext = createContext<GuestContextValue | null>(null);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GuestState>(initialState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    if (!guestModeEnabled) return;
    let next = initialState();
    try { next = readGuestState(localStorage.getItem(guestStorageKey), next); } catch { setStorageError(true); }
    current.current = next; setState(next); setReady(true);
  }, []);
  useEffect(() => {
    if (!guestModeEnabled || !ready) return;
    try { localStorage.setItem(guestStorageKey, JSON.stringify(state)); } catch { setStorageError(true); }
  }, [state, ready]);
  const act = useCallback((action: GuestAction) => {
    const next = guestReducer(current.current, action);
    current.current = next; setState(next);
  }, []);
  const reset = useCallback(() => { const next = initialState(); current.current = next; setState(next); setStorageError(false); }, []);
  return <GuestContext.Provider value={{ state, ready, storageError, act, reset }}>{children}</GuestContext.Provider>;
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) throw new Error("useGuest must be used inside GuestProvider");
  return context;
}
