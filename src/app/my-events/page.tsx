"use client";

import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { useEvents } from "@/components/event-provider";

export default function MyEvents() {
  const { events, loading, error } = useEvents();
  const myEvents = events.filter((event) => event.isJoined || event.isHost);
  return <>
    <section className="page-heading"><p className="eyebrow">YOUR PLANS, ALL TOGETHER</p><h1>My events<span className="gold-dot">.</span></h1><p className="intro">Events you’ve joined and plans you’re hosting.</p><Link className="primary" href="/events/new">Create an event ↗</Link></section>
    {error && <p className="entry-notice" role="alert">{error}</p>}
    {loading ? <p className="loading-state" role="status">Loading your events…</p> : myEvents.length ? <div className="cards">{myEvents.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">☀</span><h2>Your next plan is out there.</h2><p>Join an event or create one to start your agenda.</p><Link className="primary" href="/events">Browse events ↗</Link></div>}
    <p className="small-note bottom-note">Events and memberships are shared through Supabase.</p>
  </>;
}
