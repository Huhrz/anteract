"use client";

import Link from "next/link";
import { symbols, people, type Hangout } from "@/lib/hangouts";
import { useDemo } from "./demo-provider";
import { EventLocation } from "./event-location";

export function EventCard({ event }: { event: Hangout }) {
  const { state, ready, dispatch } = useDemo();
  const joined = Boolean(state.memberships[event.id]);
  const host = people.find((person) => person.id === event.hostId)!;
  const full = event.participants >= event.capacity;
  return <article className="card">
    <Link className={`card-art ${event.category.toLowerCase()}`} href={`/events/${event.id}`} aria-label={`Details for ${event.title}`}><span aria-hidden="true">{symbols[event.category]}</span><span className="category-label">{event.category}</span></Link>
    <div className="card-body">
      <p className="time">{event.time}</p><h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
      <p className="location"><EventLocation event={event} /></p><p className="description">{event.description}</p>
      <Link className="host-line" href={`/profiles/${host.id}`}><span className={`avatar tiny ${host.color}`}>{host.initials}</span><span>Hosted by {host.name.split(" ")[0]}</span></Link>
      <div className="card-footer"><span>{event.participants + (joined ? 1 : 0)}/{event.capacity} going</span><div className="card-actions"><Link className="details-link" href={`/events/${event.id}`}>Details</Link>{joined ? <Link className="join joined" href="/my-events">In My Events ✓</Link> : <button type="button" className="join" disabled={!ready || full} aria-label={`Join ${event.title}`} onClick={() => dispatch({ type: "join", eventId: event.id })}>{full ? "Full" : "Join"}</button>}</div></div>
    </div>
  </article>;
}
