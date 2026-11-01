"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EventCard } from "./event-card";
import type { SharedEvent } from "./event-provider";
import { categories } from "@/lib/hangouts";
import { defaultEventFilters, filterEvents, type EventFilters } from "@/lib/event-filters";
import { parseEventTags, tagLimits } from "@/lib/event-tags";

type BrowserProps = { events: SharedEvent[]; loading?: boolean; error?: string; preview?: boolean };

export function EventBrowser(props: BrowserProps) {
  return <Suspense fallback={<p className="loading-state" role="status">Loading event filters…</p>}><EventBrowserContent {...props} /></Suspense>;
}

function EventBrowserContent({ events, loading = false, error = "", preview = false }: BrowserProps) {
  const [filters, setFilters] = useState<EventFilters>({ ...defaultEventFilters });
  const tagQuery = useSearchParams().get("tag") ?? "";
  useEffect(() => {
    const parsed = parseEventTags(tagQuery);
    setFilters((current) => ({ ...current, tags: parsed.ok ? parsed.tags : [] }));
  }, [tagQuery]);

  function update(patch: Partial<EventFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    if (patch.tags) {
      const url = new URL(window.location.href);
      if (patch.tags.length) url.searchParams.set("tag", patch.tags.join(","));
      else url.searchParams.delete("tag");
      window.history.replaceState(null, "", url);
    }
  }

  const now = new Date();
  const upcoming = events.filter((event) => Date.parse(event.startsAt) > now.getTime());
  const availableTags = [...new Set([...upcoming.flatMap((event) => event.tags ?? []), ...filters.tags])].sort();
  const filteredEvents = filterEvents(events, filters, now);
  const activeCount = Number(filters.category !== "All") + Number(!!filters.query.trim()) + filters.tags.length + Number(filters.when !== "upcoming") + Number(filters.spotsOnly);
  const clear = () => update({ ...defaultEventFilters, tags: [] });

  return <>
    <section className="page-heading"><p className="eyebrow">FIND SOMETHING IN COMMON</p><h1>Browse events<span className="gold-dot">.</span></h1><p className="intro">A study buddy, a dinner crew, or a little fresh air. Your next plan starts here.</p><Link className="primary" href={preview ? "/create-demo" : "/events/new"}>{preview ? "Preview event creation ↗" : "Create an event ↗"}</Link></section>
    {preview && <p className="preview-notice" role="note">Preview with sample events. Filters work here; joining and profiles require a UCI account.</p>}
    <section className="browse-section" aria-label="Browse events">
      <div className="event-filter-panel">
        <div className="browse-toolbar"><div className="filters" role="group" aria-label="Filter events by category">{categories.map((category) => <button key={category} type="button" className={filters.category === category ? "filter selected" : "filter"} aria-pressed={filters.category === category} onClick={() => update({ category })}>{category}</button>)}</div><label className="search"><span className="sr-only">Search events, locations or tags</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search events, places, tags" value={filters.query} onChange={(event) => update({ query: event.target.value })} /></label></div>
        <div className="browse-options"><label className="when-filter">When<select value={filters.when} onChange={(event) => update({ when: event.target.value as EventFilters["when"] })}><option value="upcoming">Upcoming</option><option value="today">Today</option><option value="week">Next 7 days</option></select></label><label className="spots-filter"><input type="checkbox" checked={filters.spotsOnly} onChange={(event) => update({ spotsOnly: event.target.checked })} /> Has open spots</label>{activeCount > 0 && <button className="text-link clear-filters" type="button" onClick={clear}>Clear filters ({activeCount})</button>}</div>
        {availableTags.length > 0 && <fieldset className="tag-filters"><legend>Find your people by interest <span>Match all selected tags</span></legend><div className="tag-suggestions">{availableTags.map((tag) => <button key={tag} type="button" className={filters.tags.includes(tag) ? "tag-chip selected" : "tag-chip"} aria-pressed={filters.tags.includes(tag)} disabled={!filters.tags.includes(tag) && filters.tags.length >= tagLimits.count} onClick={() => update({ tags: filters.tags.includes(tag) ? filters.tags.filter((item) => item !== tag) : [...filters.tags, tag] })}>#{tag}</button>)}</div></fieldset>}
      </div>
      <div className="results-heading"><p aria-live="polite" role="status">{loading ? "Loading events…" : `${filteredEvents.length} ${filteredEvents.length === 1 ? "event" : "events"} to explore`}</p><Link className="text-link" href={preview ? "/login" : "/my-events"}>{preview ? "Log in to join →" : "Go to my events →"}</Link></div>
      {error ? <p className="entry-notice" role="alert">{error}</p> : loading ? <p className="loading-state">Finding your next plan…</p> : filteredEvents.length ? <div className="cards">{filteredEvents.map((event) => <EventCard key={event.id} event={event} preview={preview} />)}</div> : <div className="empty-state"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>{upcoming.length ? "No events match just yet" : "No upcoming events yet"}</h2><p>{upcoming.length ? "Try fewer tags, another date, or a different search." : "Create a plan and give your fellow Anteaters something to look forward to."}</p>{activeCount > 0 ? <button className="primary" type="button" onClick={clear}>Clear filters</button> : <Link className="primary" href={preview ? "/create-demo" : "/events/new"}>Create an event</Link>}</div>}
    </section>
  </>;
}
