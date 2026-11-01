"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import "./create-demo.css";
import { CampusLocationPicker } from "@/components/campus-location-picker";
import { EventTagInput } from "@/components/event-tag-input";
import { EventTags } from "@/components/event-tags";
import { parseEventTags } from "@/lib/event-tags";
import { EventLocation } from "@/components/event-location";
import type { CampusChoice } from "@/lib/campus-map";
import { symbols, type Hangout } from "@/lib/hangouts";
import { eventCategoryNames, eventLimits, validateNewEvent, type NewEventErrors, type NewEventField, type NewEventInput } from "@/lib/new-event";

const emptyForm = { title: "", category: "Study", startsAt: "", description: "", meetingPoint: "", bring: "", capacity: "5" };
const fieldIds: Record<NewEventField, string> = { title: "cd-title", category: "cd-category", location: "cd-location", startsAt: "cd-time", description: "cd-description", meetingPoint: "cd-meeting", bring: "cd-bring", capacity: "cd-capacity" };
const formatTime = (iso: string) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

// Public demo: nothing is saved. To make it real, send `result.value` (see handleSubmit)
// to the server instead of showing it. Rules live in src/lib/new-event.ts.
export default function CreateEventDemo() {
  const [tags, setTags] = useState("");
  const [tagError, setTagError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [location, setLocation] = useState<CampusChoice | null>(null);
  const [errors, setErrors] = useState<NewEventErrors>({});
  const [created, setCreated] = useState<NewEventInput | null>(null);
  const [earliest, setEarliest] = useState("");
  useEffect(() => { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); setEarliest(now.toISOString().slice(0, 16)); }, []);

  const set = (key: keyof typeof emptyForm, value: string) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: undefined })); };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validateNewEvent({ ...form, location: location?.label ?? "", campusMarkerId: location?.place?.markerId });
    if (!result.ok) {
      setErrors(result.errors);
      const first = (Object.keys(fieldIds) as NewEventField[]).find((key) => result.errors[key]);
      if (first) document.getElementById(fieldIds[first])?.focus();
      return;
    }
    const parsedTags = parseEventTags(tags);
    if (!parsedTags.ok) { setTagError(parsedTags.error); document.getElementById("event-tags")?.focus(); return; }
    setTagError("");
    setErrors({});
    setCreated({ ...result.value, tags: parsedTags.tags }); // Backend integration point: send result.value to the server here.
  }

  function reset() { setForm(emptyForm); setTags(""); setTagError(""); setLocation(null); setErrors({}); setCreated(null); }

  const shown = created ?? { ...form, location: location?.label ?? "", campusMarkerId: location?.place?.markerId };
  const category = (eventCategoryNames as readonly string[]).includes(shown.category) ? shown.category as NewEventInput["category"] : "Study";
  const startsAt = created ? created.startsAt : shown.startsAt && Number.isFinite(new Date(shown.startsAt).getTime()) ? shown.startsAt : "";
  const parsedPreviewTags = parseEventTags(tags);
  const preview: Hangout = {
    tags: parsedPreviewTags.ok ? parsedPreviewTags.tags : [],
    id: "preview", title: shown.title.trim() || "Your event title", category, location: location?.label ?? "", campusMapPlace: location?.place,
    time: startsAt ? formatTime(startsAt) : "Pick a date and time", description: shown.description.trim() || "What will you do together?",
    participants: 1, capacity: Number(shown.capacity) || 0, hostId: "you", attendeeIds: [], meetingPoint: shown.meetingPoint.trim(), bring: shown.bring.trim(),
  };

  const error = (key: NewEventField) => errors[key] && <p className="cd-error" id={`${fieldIds[key]}-error`} role="alert">{errors[key]}</p>;
  const invalid = (key: NewEventField) => ({ "aria-invalid": errors[key] ? true : undefined, "aria-describedby": errors[key] ? `${fieldIds[key]}-error` : undefined });

  return (
    <div className="cd-page">
      <header className="page-heading">
        <p className="eyebrow">MAKE A PLAN</p>
        <h1>Create an event<span className="gold-dot">.</span></h1>
        <p className="intro">Pick a spot, set a time, and invite other UCI students to join you.</p>
      </header>
      <div className="cd-layout">
        {created ? (
          <section className="cd-done" aria-labelledby="cd-done-title">
            <span className="cd-done-mark" aria-hidden="true">✓</span>
            <h2 id="cd-done-title">Your event is ready.</h2>
            <p>This is a demo, so nothing was published or saved. Refreshing the page clears it.</p>
            <details className="cd-payload"><summary>What the backend would receive</summary><pre>{JSON.stringify(created, null, 2)}</pre></details>
            <div className="cd-done-actions"><button className="primary" type="button" onClick={reset}>Create another event</button><Link className="text-link" href="/events">Browse events →</Link></div>
          </section>
        ) : (
          <form className="cd-form" onSubmit={handleSubmit} noValidate>
            <div className="cd-field">
              <label htmlFor="cd-title">Event title</label>
              <input id="cd-title" value={form.title} maxLength={eventLimits.title.max} placeholder="A little study company" onChange={(e) => set("title", e.target.value)} {...invalid("title")} />
              {error("title")}
            </div>
            <div className="cd-field">
              <span className="cd-legend" id="cd-category-label">Category</span>
              <div className="filters cd-categories" role="group" aria-labelledby="cd-category-label">
                {eventCategoryNames.map((name, index) => <button key={name} id={index === 0 ? "cd-category" : undefined} type="button" className={form.category === name ? "filter selected" : "filter"} aria-pressed={form.category === name} onClick={() => set("category", name)}>{name}</button>)}
              </div>
            </div>
            <div className="cd-field">
              <label htmlFor="cd-time">Date and time</label>
              <input id="cd-time" type="datetime-local" value={form.startsAt} min={earliest || undefined} onChange={(e) => set("startsAt", e.target.value)} {...invalid("startsAt")} />
              {error("startsAt")}
            </div>
            <div className="cd-field" id="cd-location" tabIndex={-1}>
              <CampusLocationPicker value={location} onChange={(choice) => { setLocation(choice); setErrors((current) => ({ ...current, location: undefined })); }} />
              {error("location")}
            </div>
            <div className="cd-field">
              <label htmlFor="cd-meeting">Meeting instructions <span>(optional)</span></label>
              <input id="cd-meeting" value={form.meetingPoint} maxLength={eventLimits.meetingPoint.max} placeholder="Meet outside the main entrance" onChange={(e) => set("meetingPoint", e.target.value)} {...invalid("meetingPoint")} />
              {error("meetingPoint")}
            </div>
            <div className="cd-field">
              <EventTagInput value={tags} onChange={(value) => { setTags(value); setTagError(""); }} />
              {tagError && <p className="cd-error" role="alert">{tagError}</p>}
            </div>
            <div className="cd-field">
              <label htmlFor="cd-description">What will you do?</label>
              <textarea id="cd-description" rows={4} value={form.description} maxLength={eventLimits.description.max} placeholder="Bring your notes. We’ll keep each other focused and take a coffee break." onChange={(e) => set("description", e.target.value)} {...invalid("description")} />
              {error("description")}
            </div>
            <div className="cd-row">
              <div className="cd-field">
                <label htmlFor="cd-bring">What to bring <span>(optional)</span></label>
                <input id="cd-bring" value={form.bring} maxLength={eventLimits.bring.max} placeholder="Your laptop and notes" onChange={(e) => set("bring", e.target.value)} {...invalid("bring")} />
                {error("bring")}
              </div>
              <div className="cd-field cd-capacity">
                <label htmlFor="cd-capacity">Group size <span>(including you)</span></label>
                <input id="cd-capacity" type="number" inputMode="numeric" min={eventLimits.capacity.min} max={eventLimits.capacity.max} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} {...invalid("capacity")} />
                {error("capacity")}
              </div>
            </div>
            <button className="primary cd-submit" type="submit">Create event <span aria-hidden="true">↗</span></button>
          </form>
        )}
        <aside className="cd-preview" aria-label="Event preview">
          <p className="eyebrow">{created ? "YOUR EVENT" : "LIVE PREVIEW"}</p>
          <article className="card">
            <div className={`card-art ${category.toLowerCase()}`} aria-hidden="true"><span>{symbols[category]}</span><span className="category-label">{category}</span></div>
            <div className="card-body">
              <p className="time">{preview.time}</p>
              <h2>{preview.title}</h2>
              <p className="location">{location ? <EventLocation event={preview} /> : <span className="cd-placeholder">⌖ Choose a location</span>}</p>
              <p className="description">{preview.description}</p><EventTags tags={preview.tags} browsePath="/events-demo" />
              {preview.meetingPoint && <div className="location-preview-meeting"><strong>Meeting point</strong><p>{preview.meetingPoint}</p></div>}
              <p className="cd-going">1/{preview.capacity || "—"} going · You’re the host</p>
            </div>
          </article>
          <p className="small-note">Demo only. Nothing is published.</p>
        </aside>
      </div>
    </div>
  );
}