"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { eventCategoryTone, eventCategorySymbol } from "@/lib/hangouts";
import type { SharedEvent } from "./event-provider";
import { useEvents } from "./event-provider";
import { EventTags } from "./event-tags";
import { EventLocation } from "./event-location";
import { useEventPeople } from "./event-people";
import { ProfileAvatar } from "./profile-avatar";

export function EventCard({ event, variant = "default", past = false }: { event: SharedEvent; variant?: "default" | "personal" | "discovery"; past?: boolean }) {
  const { joinEvent } = useEvents();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const joined = event.isJoined;
  const full = event.participants >= event.capacity;
  if (variant !== "default") return <CompactEventCard event={event} past={past} discovery={variant === "discovery"} action={variant === "discovery" && !event.isHost && !joined ? <button type="button" className="join" disabled={busy || full} aria-label={`Join ${event.title}`} onClick={async () => {
    setBusy(true); setError("");
    try { await joinEvent(event.id); }
    catch (joinError) { setError(joinError && typeof joinError === "object" && "message" in joinError ? String(joinError.message) : "Could not join this event."); }
    finally { setBusy(false); }
  }}>{full ? "Full" : busy ? "Joining…" : "Join"}</button> : null} error={error} />;
  return <article className="card">
    <Link className={`card-art ${eventCategoryTone(event.category)}`} href={`/events/${event.id}`} aria-label={`Details for ${event.title}`}><span aria-hidden="true">{eventCategorySymbol(event.category)}</span><span className="category-label">{event.category}</span></Link>
    <div className="card-body">
      <p className="time">{event.time}</p><h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
      <p className="location"><EventLocation event={event} /></p><p className="description">{event.description}</p>
      <EventTags tags={event.tags} />
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


function CompactEventCard({ event, past, discovery, action, error }: { event: SharedEvent; past: boolean; discovery: boolean; action: ReactNode; error: string }) {
  const date = new Date(event.startsAt);
  return <article className={`personal-event-card${discovery ? " discovery-event-card" : ""}`}>
    <Link className={`personal-event-art ${eventCategoryTone(event.category)}`} href={`/events/${event.id}`} aria-label={`Details for ${event.title}`} tabIndex={-1}>
      <time className="personal-event-date" dateTime={event.startsAt}><span>{date.toLocaleDateString(undefined, { month: "short" })}</span><strong>{date.getDate()}</strong></time>
      <span className="personal-event-category">{event.category}</span><span className="personal-event-symbol" aria-hidden="true">{eventCategorySymbol(event.category)}</span>
    </Link>
    <div className="personal-event-body">
      <div className="personal-event-badges">{(event.isHost || event.isJoined) && <span className={`personal-event-role ${event.isHost ? "hosting" : "attending"}`}>{event.isHost ? "Hosting" : "Attending"}</span>}{past && <span className="personal-event-past">Past event</span>}</div>
      <h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
      <time className="personal-event-time" dateTime={event.startsAt}>{event.time}</time>
      <div className="personal-event-location"><EventLocation event={event} /></div>
      {!discovery && event.description && <p className="personal-event-description">{event.description}</p>}
      {discovery && <><EventTags tags={event.tags} /><OrganizerProfileButton event={event} /></>}
      <div className="personal-event-footer"><span>{discovery ? `${Math.max(0, event.capacity - event.participants)} spots left` : `${event.participants} / ${event.capacity} ${past ? "participants" : "going"}`}</span><Link href={`/events/${event.id}`} aria-label={`View event: ${event.title}`}>View event <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></Link>{action}</div>
      {error && <p className="entry-notice" role="alert">{error}</p>}
    </div>
  </article>;
}


function OrganizerProfileButton({ event }: { event: SharedEvent }) {
  const { people } = useEventPeople(event.hostId, []);
  const organizer = people.find(person => person.id === event.hostId);
  const name = organizer?.display_name || event.hostName;
  return <Link className="discovery-host" href={`/profiles/${event.hostId}`} aria-label={`View organizer profile: ${name}`} title={`Organizer: ${name}`}>
    <ProfileAvatar name={name} photoUrl={organizer?.photoUrl} />
    <span>{name}</span><span className="discovery-host-arrow" aria-hidden="true">↗</span>
  </Link>;
}
