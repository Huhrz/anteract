"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/components/demo-provider";
import { hangouts, people, symbols } from "@/lib/hangouts";

const filters = ["All", "Joined", "Confirmed", "Arrived"] as const;
export default function MyEvents() {
  const { state, ready, dispatch } = useDemo();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const events = hangouts.filter((event) => state.memberships[event.id] && (filter === "All" || state.memberships[event.id] === filter.toLowerCase()));
  const joinedCount = Object.keys(state.memberships).length;
  const confirmedCount = Object.values(state.memberships).filter((status) => status === "confirmed" || status === "arrived").length;
  const arrivedCount = Object.values(state.memberships).filter((status) => status === "arrived").length;
  return <>
    <section className="page-heading"><p className="eyebrow">YOUR PLANS, ALL TOGETHER</p><h1>My events<span className="gold-dot">.</span></h1><p className="intro">A little follow-through goes a long way. Confirm your plans, then let your group know you’re here.</p></section>
    <div className="agenda-stats"><div><strong>{ready ? joinedCount : "—"}</strong><span>In your agenda</span></div><div><strong>{ready ? confirmedCount : "—"}</strong><span>Attendance confirmed</span></div><div><strong>{ready ? arrivedCount : "—"}</strong><span>Arrived</span></div><Link className="text-link" href="/events">Find another plan ↗</Link></div>
    <div className="filters agenda-filters" aria-label="Filter my events">{filters.map((item) => <button type="button" key={item} className={filter === item ? "filter selected" : "filter"} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    {!ready ? <p className="loading-state" role="status">Loading your agenda…</p> : events.length ? <div className="agenda-list">{events.map((event) => {
      const status = state.memberships[event.id];
      const host = people.find((person) => person.id === event.hostId)!;
      return <article className="agenda-card" key={event.id} aria-label={event.title}>
        <div className="agenda-main"><div className={`agenda-icon ${event.category.toLowerCase()}`} aria-hidden="true">{symbols[event.category]}</div><div className="agenda-info"><p className="time">{event.time} <span className={`status-badge ${status}`}>{status === "arrived" ? "Arrived ✓" : status === "confirmed" ? "Confirmed ✓" : "Joined"}</span></p><h2><Link href={`/events/${event.id}`}>{event.title}</Link></h2><p className="location">⌖ {event.location}</p></div><Link className="details-link" href={`/events/${event.id}`}>View details ↗</Link></div>
        <div className="agenda-bottom"><ol className="progress-steps" aria-label="Attendance progress"><li className="complete"><span>✓</span> Joined</li><li className={status !== "joined" ? "complete" : ""}><span>{status !== "joined" ? "✓" : "2"}</span> Confirm</li><li className={status === "arrived" ? "complete" : ""}><span>{status === "arrived" ? "✓" : "3"}</span> Arrived</li></ol><div className="attendance-actions"><button type="button" className="primary" disabled={status !== "joined"} onClick={() => dispatch({ type: "confirm", eventId: event.id })}>{status === "joined" ? "Confirm" : "Confirmed ✓"}</button><button type="button" className={status === "arrived" ? "secondary arrived-button" : "secondary"} disabled={status !== "confirmed"} onClick={() => dispatch({ type: "arrive", eventId: event.id })}>{status === "arrived" ? "Arrived ✓" : "Arrived"}</button></div></div>
        <div className="agenda-foot"><Link className="host-line" href={`/profiles/${host.id}`}><span className={`avatar tiny ${host.color}`}>{host.initials}</span><span>View {host.name.split(" ")[0]}’s profile & chat →</span></Link><button className="quiet-button" type="button" onClick={() => dispatch({ type: "leave", eventId: event.id })}>Leave event</button></div>
        <p className="attendance-note" role="status">{status === "joined" ? "First confirm you’re coming. Then mark Arrived when you reach the meeting point." : status === "confirmed" ? "You’re confirmed! Mark Arrived when you reach the meeting point." : "You’ve marked yourself as arrived. Say hello to your group!"}</p>
      </article>;
    })}</div> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">☀</span><h2>{joinedCount ? `No ${filter.toLowerCase()} events yet` : "Your next plan is out there."}</h2><p>{joinedCount ? "Try another filter or update an event’s attendance status." : "Join an event to add it to your agenda. A little company can make your day."}</p>{joinedCount ? <button type="button" className="primary" onClick={() => setFilter("All")}>Show all my events</button> : <Link className="primary" href="/events">Browse events ↗</Link>}</div>}
    <p className="small-note bottom-note">Demo attendance is self-reported and saved in this browser. Event times are sample labels.</p>
  </>;
}
