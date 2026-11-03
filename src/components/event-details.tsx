"use client";

import Link from "next/link";
import { useState } from "react";
import { eventCategoryTone, eventCategorySymbol } from "@/lib/hangouts";
import { useEvents, type SharedEvent } from "./event-provider";
import { CampusMap } from "./campus-map";
import { EventTags } from "./event-tags";
import { EventLocation } from "./event-location";

export function EventDetails({ event }: { event: SharedEvent }) {
  const { joinEvent, leaveEvent, cancelEvent } = useEvents();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const full = event.participants >= event.capacity;
  const symbol = eventCategorySymbol(event.category);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try { await action(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Could not update this event."); }
    finally { setBusy(false); }
  }

  return <div className="detail-page">
    <Link className="back-link" href="/events">← Browse events</Link>
    <div className={`event-banner ${eventCategoryTone(event.category)}`}><span className="category-label">{event.category} hangout</span><span className="banner-symbol" aria-hidden="true">{symbol}</span><p>One plan. A few new faces.</p></div>
    <div className="detail-grid">
      <section className="detail-content"><p className="eyebrow">LET’S MAKE A PLAN</p><h1>{event.title}</h1><Link className="host-line large" href={`/profiles/${event.hostId}`}><span className="avatar blue">{event.hostName.slice(0, 1).toUpperCase()}</span><span>Hosted by <strong>{event.hostName}</strong><small>View profile →</small></span></Link>
        <EventTags tags={event.tags} />
        <h2>About this hangout</h2><p className="body-copy">{event.description}</p>
        <h2>Where to meet</h2><p className="body-copy">{event.meetingPoint || event.location}</p>
        <CampusMap event={event} />
        {event.bring && <><h2>What to bring</h2><p className="body-copy">{event.bring}</p></>}
        <div className="people-heading"><h2>Who’s going</h2><span>{event.participants} / {event.capacity}</span></div><p className="small-note">Includes the host and {event.attendeeIds.length} {event.attendeeIds.length === 1 ? "student" : "students"} who joined.</p>
      </section>
      <aside className="event-summary"><p className="eyebrow">THE PLAN</p><div className="summary-item"><span aria-hidden="true">◷</span><div><small>When</small><strong>{event.time}</strong></div></div><div className="summary-item"><span aria-hidden="true">⌖</span><div><small>Where</small><strong><EventLocation event={event} /></strong></div></div><div className="summary-item"><span aria-hidden="true">♧</span><div><small>The group</small><strong>{event.participants} of {event.capacity} spots filled</strong></div></div>
        {event.isHost ? <button type="button" className="secondary full-width" disabled={busy} onClick={() => {
          if (window.confirm("Cancel this event? It will be removed for everyone.")) void run(() => cancelEvent(event.id));
        }}>{busy ? "Cancelling…" : "Cancel event"}</button> : event.isJoined ? <><p className="summary-success" role="status">✓ This event is in your agenda.</p><Link className="primary full-width" href="/my-events">Go to My Events →</Link><button type="button" className="quiet-button full-width" disabled={busy} onClick={() => void run(() => leaveEvent(event.id))}>{busy ? "Leaving…" : "Leave event"}</button></> : <><button type="button" className="primary full-width" disabled={busy || full} onClick={() => void run(() => joinEvent(event.id))}>{full ? "This event is full" : busy ? "Joining…" : "Join event"}</button><p className="small-note centered">Your plan will appear in My Events.</p></>}
        {error && <p className="entry-notice" role="alert">{error}</p>}
        <p className="summary-note">A familiar place. A shared activity.<br />A good way to break the ice.</p>
      </aside>
    </div>
  </div>;
}
