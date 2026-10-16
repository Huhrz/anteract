import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { hangouts } from "@/lib/hangouts";

export default function Home() {
  return <>
    <section className="hero" aria-labelledby="page-title">
      <p className="eyebrow"><span aria-hidden="true">✦</span> A LITTLE PLAN. A NEW CONNECTION.</p>
      <h1 id="page-title">Find your people.<br /><span>Start with a hangout.</span></h1>
      <p className="intro">Study together, grab a bite, or take a campus break.<br className="desktop-break" /> Meeting someone new starts with something simple.</p>
      <div className="button-row"><Link className="primary" href="/events">Explore events <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/my-events">View my events →</Link></div>
      <div className="hero-decoration" aria-hidden="true"><span>Say hello.</span><div className="orbit"><img src="/anteater.svg" alt="" width="132" height="132" /></div><span>Go do something.</span></div>
    </section>
    <section className="how-it-works" aria-label="How Anteract works">
      <div><span className="step-number">01</span><div><strong>Find your plan</strong><p>A shared activity is a good place to start.</p></div></div>
      <div><span className="step-number">02</span><div><strong>Make it happen</strong><p>Join an event and confirm you’re coming.</p></div></div>
      <div><span className="step-number">03</span><div><strong>Say hello</strong><p>Chat with your group, then mark your arrival.</p></div></div>
    </section>
    <section className="activities" aria-labelledby="hangouts-title">
      <div className="section-heading"><div><p className="eyebrow">A LITTLE INSPIRATION</p><h2 id="hangouts-title">Good plans, better company.</h2></div><Link className="text-link" href="/events">Browse all events →</Link></div>
      <div className="cards home-cards">{hangouts.map((event) => <EventCard key={event.id} event={event} />)}</div>
    </section>
  </>;
}
