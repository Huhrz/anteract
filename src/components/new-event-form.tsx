"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { categories } from "@/lib/hangouts";
import { useEvents } from "@/components/event-provider";

const eventCategories = categories.filter((category): category is Exclude<typeof category, "All"> => category !== "All");

export default function NewEventForm() {
  const router = useRouter();
  const { createEvent } = useEvents();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startsAt = new Date(String(form.get("starts_at") ?? ""));
    if (!Number.isFinite(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      setError("Choose a date and time in the future.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = await createEvent({
        title: String(form.get("title") ?? "").trim(),
        category: String(form.get("category")) as Exclude<typeof categories[number], "All">,
        location: String(form.get("location") ?? "").trim(),
        startsAt: startsAt.toISOString(),
        description: String(form.get("description") ?? "").trim(),
        meetingPoint: String(form.get("meeting_point") ?? "").trim(),
        bring: String(form.get("bring") ?? "").trim(),
        capacity: Number(form.get("capacity")),
      });
      router.push(`/events/${id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create the event.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="profile-editor">
    <Link className="back-link" href="/events">← Browse events</Link>
    <div className="page-heading"><p className="eyebrow">MAKE A PLAN</p><h1>Create an event<span className="gold-dot">.</span></h1><p className="intro">Invite UCI students to join you.</p></div>
    <form className="profile-form" onSubmit={submit}>
      <label htmlFor="event-title">Event title</label>
      <input id="event-title" name="title" required minLength={3} maxLength={100} placeholder="A little study company" />
      <label htmlFor="event-category">Category</label>
      <select id="event-category" name="category" required defaultValue="Study">{eventCategories.map((category) => <option key={category}>{category}</option>)}</select>
      <label htmlFor="event-location">Location</label>
      <input id="event-location" name="location" required minLength={2} maxLength={120} placeholder="Science Library" />
      <label htmlFor="event-time">Date and time</label>
      <input id="event-time" name="starts_at" type="datetime-local" required />
      <label htmlFor="event-description">Description</label>
      <textarea id="event-description" name="description" required minLength={10} maxLength={1000} rows={4} placeholder="What will you do together?" />
      <label htmlFor="meeting-point">Meeting point details</label>
      <input id="meeting-point" name="meeting_point" maxLength={300} placeholder="Meet outside the main entrance" />
      <label htmlFor="event-bring">What to bring</label>
      <input id="event-bring" name="bring" maxLength={300} placeholder="Your laptop and notes" />
      <label htmlFor="event-capacity">Group size (including you)</label>
      <input id="event-capacity" name="capacity" type="number" required min={2} max={50} defaultValue={5} />
      {error && <p className="entry-notice" role="alert">{error}</p>}
      <button className="primary" type="submit" disabled={saving}>{saving ? "Creating…" : "Create event"}</button>
    </form>
  </section>;
}
