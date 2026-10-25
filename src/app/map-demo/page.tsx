"use client";

import { useState } from "react";
import { CampusLocationPicker } from "@/components/campus-location-picker";
import { EventLocation } from "@/components/event-location";
import { getCampusMap, type CampusMapPlace } from "@/lib/campus-map";
import { hangouts, symbols } from "@/lib/hangouts";

type EventDraft = { location: string; campusMapPlace?: CampusMapPlace; meetingPoint: string };

// Public, fictional sample events only. Normal event pages retain their login checks.
export default function MapDemo() {
  const [selectedId, setSelectedId] = useState(hangouts[0].id);
  const [drafts, setDrafts] = useState<Record<string, EventDraft>>({});
  const original = hangouts.find((item) => item.id === selectedId)!;
  const draft = drafts[selectedId];
  const event = {
    ...original,
    ...draft,
    meetingPoint: draft ? draft.meetingPoint.trim() || "The host hasn’t added an exact meeting point yet." : original.meetingPoint,
  };

  function selectPlace(place: CampusMapPlace) {
    const samePin = getCampusMap(event.campusLocationId, event.campusMapPlace).location?.markerId === place.markerId;
    setDrafts((current) => ({ ...current, [selectedId]: {
      location: place.label,
      campusMapPlace: place,
      // Don't keep instructions for the old building when moving the event.
      meetingPoint: samePin ? draft?.meetingPoint ?? original.meetingPoint : "",
    } }));
  }
  return (
    <div className="map-demo-page location-demo-page">
      <header className="page-heading">
        <p className="eyebrow">CAMPUS MAP DEMO</p>
        <h1>Choose where to meet<span className="gold-dot">.</span></h1>
        <p className="intro">Try choosing a location for a sample event: search UCI’s map, review the pin, and use it on your event.</p>
      </header>
      <div className="map-demo-picker" role="group" aria-label="Choose a sample event">
        {hangouts.map((item) => (
          <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
            <span>{item.category}</span><strong>{item.title}</strong><small>{drafts[item.id]?.location ?? item.location}</small>
          </button>
        ))}
      </div>
      <div className="location-demo-layout">
        <CampusLocationPicker key={selectedId} event={event} onSelect={selectPlace} />
        <aside className="location-event-preview" aria-label="Demo event preview">
          <p className="eyebrow">YOUR DEMO EVENT</p>
          <article className="card">
            <div className={`card-art ${event.category.toLowerCase()}`} aria-hidden="true"><span>{symbols[event.category]}</span><span className="category-label">{event.category}</span></div>
            <div className="card-body"><p className="time">{event.time}</p><h2>{event.title}</h2><p className="location"><EventLocation event={event} /></p><p className="description">{event.description}</p><div className="location-preview-meeting"><strong>Meeting point</strong><p>{event.meetingPoint}</p></div></div>
          </article>
          <label className="meeting-instructions-label" htmlFor="meeting-instructions">Meeting instructions (optional)</label>
          <textarea id="meeting-instructions" maxLength={500} rows={3} placeholder="e.g. Outside the main entrance" value={draft?.meetingPoint ?? original.meetingPoint} onChange={(e) => setDrafts((current) => ({ ...current, [selectedId]: { location: event.location, campusMapPlace: event.campusMapPlace, meetingPoint: e.target.value } }))} />
          <p className="small-note">Demo only. No event is published. Refresh to reset your changes.</p>
        </aside>
      </div>
    </div>
  );
}
