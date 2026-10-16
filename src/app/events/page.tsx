"use client";

import { useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { categories, hangouts, type Category } from "@/lib/hangouts";

export default function BrowseEvents() {
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const events = hangouts.filter((event) => (category === "All" || event.category === category) && `${event.title} ${event.location} ${event.description}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <>
    <section className="page-heading"><p className="eyebrow">FIND SOMETHING IN COMMON</p><h1>Browse events<span className="gold-dot">.</span></h1><p className="intro">A study buddy, a dinner crew, or a little fresh air. Your next plan starts here.</p></section>
    <section className="browse-section" aria-label="Browse events">
      <div className="browse-toolbar"><div className="filters" aria-label="Filter events by category">{categories.map((item) => <button key={item} type="button" className={category === item ? "filter selected" : "filter"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search"><span className="sr-only">Search events or locations</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search events or locations" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      <div className="results-heading"><p aria-live="polite">{events.length} {events.length === 1 ? "event" : "events"} to explore</p><Link className="text-link" href="/my-events">Go to my events →</Link></div>
      {events.length ? <div className="cards">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>No events found</h2><p>Try another category or a different search.</p><button className="primary" type="button" onClick={() => { setCategory("All"); setSearch(""); }}>Clear filters</button></div>}
      <p className="small-note">Sample events for the prototype. Joining adds an event to My Events.</p>
    </section>
  </>;
}
