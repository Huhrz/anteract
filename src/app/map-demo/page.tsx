"use client";

import { useState } from "react";
import { CampusMap } from "@/components/campus-map";
import { EventLocation } from "@/components/event-location";
import { hangouts } from "@/lib/hangouts";

// Public, fictional sample events only. Normal event pages retain their login checks.
export default function MapDemo() {
  const [selectedId, setSelectedId] = useState(hangouts[0].id);
  const event = hangouts.find((item) => item.id === selectedId)!;
  return (
    <div className="map-demo-page">
      <header className="page-heading">
        <p className="eyebrow">CAMPUS MAP DEMO</p>
        <h1>A place to meet<span className="gold-dot">.</span></h1>
        <p className="intro">Pick a sample event to find its location on UCI’s official campus map. No sign-in is needed for this demo.</p>
      </header>
      <div className="map-demo-picker" role="group" aria-label="Choose a sample event">
        {hangouts.map((item) => (
          <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
            <span>{item.category}</span><strong>{item.location}</strong>
          </button>
        ))}
      </div>
      <section className="map-demo-event" aria-label="Selected event">
        <p className="time">{event.time} · Sample event</p>
        <h2>{event.title}</h2>
        <p className="location"><EventLocation event={event} /></p>
        <p className="body-copy">{event.meetingPoint}</p>
      </section>
      <CampusMap event={event} />
    </div>
  );
}
