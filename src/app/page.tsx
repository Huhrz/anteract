"use client";

import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { useEvents } from "@/components/event-provider";

export default function Home() {
  const { events, loading } = useEvents();
  return <>
    <section className="hero" aria-labelledby="page-title">
      <p className="eyebrow">YOUR CAMPUS. YOUR PEOPLE.</p>
      <h1 id="page-title">A little hello.<br /><span>A new connection.</span></h1>
      <p className="intro">Find a study buddy, grab a bite, or take a campus break.<br className="desktop-break" /> Good company could be just around the corner.</p>
      <div className="button-row"><Link className="primary" href="/events">Explore events <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/my-events">View my events →</Link></div>
      <div className="hero-decoration" aria-hidden="true"><span>SAY HELLO.</span><div className="orbit"><img src="/anteater.svg" alt="" width="132" height="132" /></div><span>GO DO SOMETHING.</span></div>
    </section>
    <section className="how-it-works" aria-label="How Anteract works">
      <div><span className="step-number">01</span><div><strong>Find your plan</strong><p>A shared activity is a good place to start.</p></div></div>
      <div><span className="step-number">02</span><div><strong>Make it happen</strong><p>Join an event and confirm you’re coming.</p></div></div>
      <div><span className="step-number">03</span><div><strong>Say hello</strong><p>Chat with your group before you meet.</p></div></div>
    </section>
    <section className="activities" aria-labelledby="hangouts-title">
      <div className="section-heading"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2 id="hangouts-title">Good plans, better company.</h2></div><Link className="text-link" href="/events">Browse all events →</Link></div>
      {loading ? <p className="loading-state" role="status">Loading events…</p> : events.length ? <div className="cards home-cards">{events.slice(0, 3).map(event => <EventCard key={event.id} event={event} />)}</div> : <p className="body-copy">No events yet. <Link className="text-link" href="/events/new">Create the first event →</Link></p>}
    </section>
  </>;
}
