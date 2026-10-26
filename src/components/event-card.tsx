"use client";

import Link from "next/link";
import { useState } from "react";
import { symbols } from "@/lib/hangouts";
import type { SharedEvent } from "./event-provider";
import { useEvents } from "./event-provider";
import { EventLocation } from "./event-location";

export function EventCard({ event }: { event: SharedEvent }) {
  const { joinEvent } = useEvents();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const joined = event.isJoined;
  const full = event.participants >= event.capacity;
  return <article className="card">
    <Link className={`card-art ${event.category.toLowerCase()}`} href={`/events/${event.id}`} aria-label={`Details for ${event.title}`}><span aria-hidden="true">{symbols[event.category]}</span><span className="category-label">{event.category}</span></Link>
    <div className="card-body">
      <p className="time">{event.time}</p><h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
      <p className="location"><EventLocation event={event} /></p><p className="description">{event.description}</p>
      <Link className="host-line" href={`/profiles/${event.hostId}`}><span className="avatar tiny blue">{event.hostName.slice(0, 1).toUpperCase()}</span><span>Hosted by {event.hostName.split(" ")[0]}</span></Link>
      <div className="card-footer"><span>{event.participants}/{event.capacity} going</span><div className="card-actions"><Link className="details-link" href={`/events/${event.id}`}>Details</Link>{event.isHost ? <Link className="join joined" href={`/events/${event.id}`}>Hosting</Link> : joined ? <Link className="join joined" href="/my-events">In My Events ✓</Link> : <button type="button" className="join" disabled={busy || full} aria-label={`Join ${event.title}`} onClick={async () => {
        setBusy(true); setError("");
        try { await joinEvent(event.id); }
        catch (joinError) { setError(joinError instanceof Error ? joinError.message : "Could not join this event."); }
        finally { setBusy(false); }
      }}>{full ? "Full" : busy ? "Joining…" : "Join"}</button>}</div></div>
      {error && <p className="entry-notice" role="alert">{error}</p>}
    </div>
  </article>;
}
