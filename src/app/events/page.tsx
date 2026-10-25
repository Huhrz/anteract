"use client";

import { useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { categories, type Category } from "@/lib/hangouts";
import { useEvents } from "@/components/event-provider";

export default function BrowseEvents() {
  const { events, loading, error } = useEvents();
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const filteredEvents = events.filter((event) => (category === "All" || event.category === category) && `${event.title} ${event.location} ${event.description}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <>
    <section className="page-heading"><p className="eyebrow">FIND SOMETHING IN COMMON</p><h1>Browse events<span className="gold-dot">.</span></h1><p className="intro">A study buddy, a dinner crew, or a little fresh air. Your next plan starts here.</p><Link className="primary" href="/events/new">Create an event ↗</Link></section>
    <section className="browse-section" aria-label="Browse events">
      <div className="browse-toolbar"><div className="filters" aria-label="Filter events by category">{categories.map((item) => <button key={item} type="button" className={category === item ? "filter selected" : "filter"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search"><span className="sr-only">Search events or locations</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search events or locations" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      <div className="results-heading"><p aria-live="polite">{filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} to explore</p><Link className="text-link" href="/my-events">Go to my events →</Link></div>
      {error && <p className="entry-notice" role="alert">{error}</p>}
      {loading ? <p className="loading-state" role="status">Loading events…</p> : filteredEvents.length ? <div className="cards">{filteredEvents.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>{events.length ? "No events found" : "No events yet"}</h2><p>{events.length ? "Try another category or a different search." : "Create the first event and invite your fellow Anteaters."}</p>{events.length > 0 && <button className="primary" type="button" onClick={() => { setCategory("All"); setSearch(""); }}>Clear filters</button>}</div>}
    </section>
  </>;
}
