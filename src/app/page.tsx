"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return <div className="home-page">
    <section className="hero" aria-labelledby="page-title">
      <p className="eyebrow">YOUR CAMPUS. YOUR PEOPLE.</p>
      <h1 id="page-title">A little hello.<br /><span>A new connection.</span></h1>
      <p className="intro">Find a study buddy, grab a bite, or take a campus break.<br className="desktop-break" /> Good company could be just around the corner.</p>
      <div className="button-row"><Link className="primary" href="/events">Explore events <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/my-events">View my events →</Link></div>
      <div className="hero-decoration" aria-hidden="true"><span>SAY HELLO.</span><div className="orbit"><img src="/anteater.svg" alt="" width="132" height="132" /></div><span>GO DO SOMETHING.</span></div>
    </section>
    <Reveal><section className="how-it-works" aria-label="How Anteract works">
      <div><span className="step-number">01</span><div><strong>Find your plan</strong><p>A shared activity is a good place to start.</p></div></div>
      <div><span className="step-number">02</span><div><strong>Make it happen</strong><p>Join an event and confirm you’re coming.</p></div></div>
      <div><span className="step-number">03</span><div><strong>Say hello</strong><p>Chat with your group before you meet.</p></div></div>
    </section>
    </Reveal>
  </div>;
}
