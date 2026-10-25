"use client";

import Link from "next/link";
import { people, symbols, type Hangout } from "@/lib/hangouts";
import { useDemo } from "./demo-provider";
import { CampusMap } from "./campus-map";
import { EventLocation } from "./event-location";

export function EventDetails({ event }: { event: Hangout }) {
  const { state, ready, dispatch } = useDemo();
  const status = state.memberships[event.id];
  const host = people.find((person) => person.id === event.hostId)!;
  const attendees = people.filter((person) => event.attendeeIds.includes(person.id));
  const full = event.participants >= event.capacity;
  return <div className="detail-page">
    <Link className="back-link" href="/events">← Browse events</Link>
    <div className={`event-banner ${event.category.toLowerCase()}`}><span className="category-label">{event.category} hangout</span><span className="banner-symbol" aria-hidden="true">{symbols[event.category]}</span><p>One plan. A few new faces.</p></div>
    <div className="detail-grid">
      <section className="detail-content"><p className="eyebrow">LET’S MAKE A PLAN</p><h1>{event.title}</h1><Link className="host-line large" href={`/profiles/${host.id}`}><span className={`avatar ${host.color}`}>{host.initials}</span><span>Hosted by <strong>{host.name}</strong><small>View profile →</small></span></Link>
        <h2>About this hangout</h2><p className="body-copy">{event.description} No need to know anyone beforehand. Just come as you are.</p>
        <h2>Where to meet</h2><p className="body-copy">{event.meetingPoint}</p><CampusMap event={event} /><h2>What to bring</h2><p className="body-copy">{event.bring}</p>
        <div className="people-heading"><h2>Who’s going</h2><span>{event.participants + (status ? 1 : 0)} / {event.capacity}</span></div><p className="small-note">Select someone’s profile to say hello.</p>
        <div className="people-list">{attendees.map((person) => <Link className="person-row" key={person.id} href={`/profiles/${person.id}`}><span className={`avatar ${person.color}`}>{person.initials}</span><span><strong>{person.name}</strong><small>{person.id === event.hostId ? "Host" : person.major}</small></span><span className="row-arrow" aria-hidden="true">↗</span></Link>)}{status && <div className="person-row you-row"><span className="avatar blue">Y</span><span><strong>You</strong><small>{status === "arrived" ? "Arrived" : status === "confirmed" ? "Attendance confirmed" : "Joined"}</small></span></div>}</div>
      </section>
      <aside className="event-summary"><p className="eyebrow">THE PLAN</p><div className="summary-item"><span aria-hidden="true">◷</span><div><small>When</small><strong>{event.time}</strong></div></div><div className="summary-item"><span aria-hidden="true">⌖</span><div><small>Where</small><strong><EventLocation event={event} /></strong></div></div><div className="summary-item"><span aria-hidden="true">♧</span><div><small>The group</small><strong>{event.participants + (status ? 1 : 0)} of {event.capacity} spots filled</strong></div></div>
        {status ? <><p className="summary-success" role="status">✓ This event is in your agenda.</p><Link className="primary full-width" href="/my-events">Go to My Events →</Link><button type="button" className="quiet-button full-width" disabled={!ready} onClick={() => dispatch({ type: "leave", eventId: event.id })}>Leave event</button></> : <><button type="button" className="primary full-width" disabled={!ready || full} onClick={() => dispatch({ type: "join", eventId: event.id })}>{full ? "This event is full" : "Join event"}</button><p className="small-note centered">Your plan will appear in My Events.</p></>}
        <p className="summary-note">A familiar place. A shared activity.<br />A good way to break the ice.</p>
      </aside>
    </div>
  </div>;
}
