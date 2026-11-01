"use client";

import { useState } from "react";
import { EventBrowser } from "@/components/event-browser";
import type { SharedEvent } from "@/components/event-provider";

function sampleEvents(): SharedEvent[] {
  const at = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  const seeds = [
    { id: "study-preview", title: "A little study company", category: "Study", location: "Science Library", description: "Bring your notes. We’ll keep each other focused, then take a well-earned coffee break.", tags: ["finals", "coffee", "beginner-friendly"], startsAt: at(1, 16), participants: 2, capacity: 5, hostName: "Maya Chen" },
    { id: "food-preview", title: "New faces, familiar flavors", category: "Food", location: "University Town Center", description: "A casual dinner and a new face. Come share your favorite food spot around campus.", tags: ["coffee", "first-years"], startsAt: at(1, 18), participants: 6, capacity: 6, hostName: "Jordan Lee" },
    { id: "walk-preview", title: "Take a park break", category: "Active", location: "Aldrich Park", description: "Step away from your screen for a relaxed campus walk and a little good conversation.", tags: ["outdoors", "beginner-friendly"], startsAt: at(2, 10), participants: 1, capacity: 4, hostName: "Alex Rivera" },
    { id: "games-preview", title: "Study, then board games", category: "Study", location: "Student Center", description: "One focused hour, then a friendly game. All majors and all experience levels welcome.", tags: ["finals", "board-games", "beginner-friendly"], startsAt: at(3, 15), participants: 3, capacity: 6, hostName: "Sam Patel" },
  ] as const;
  return seeds.map((event) => ({ ...event, tags: [...event.tags], time: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(event.startsAt)), hostId: event.id, attendeeIds: [], meetingPoint: "Meet at the main entrance.", bring: "", isJoined: false, isHost: false }));
}

export default function EventsDemo() {
  const [events] = useState(sampleEvents);
  return <EventBrowser events={events} preview />;
}
