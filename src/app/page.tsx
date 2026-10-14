"use client";

import { useState } from "react";
import { categories, hangouts, type Category } from "@/lib/hangouts";

const symbols = { Study: "✎", Food: "☕", Active: "↗" };

export default function Home() {
  const [category, setCategory] = useState<Category>("All");
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const visibleHangouts = hangouts.filter((hangout) => category === "All" || hangout.category === category);

  function toggleJoin(id: string, title: string) {
    const alreadyJoined = joinedIds.includes(id);
    // Backend integration point: await joinHangout(id) or leaveHangout(id).
    setJoinedIds((current) => alreadyJoined ? current.filter((item) => item !== id) : [...current, id]);
    setNotice(alreadyJoined ? `You left ${title}.` : `You joined ${title}. See you there!`);
  }

  return (
    <>
      <header className="header">
        <a className="brand" href="/" aria-label="Anteract home"><span className="brand-mark" aria-hidden="true"><img src="/anteater.svg" alt="" width="31" height="31" /></span>anteract</a>
        <span className="campus">Made for UCI students</span>
      </header>
      <main>
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow"><span aria-hidden="true">✦</span> A LITTLE PLAN. A NEW CONNECTION.</p>
          <h1 id="page-title">Find your people.<br /><span>Start with a hangout.</span></h1>
          <p className="intro">Study together, grab a bite, or take a campus break.<br className="desktop-break" /> Meeting someone new starts with something simple.</p>
          <a className="primary hero-link" href="#hangouts">Explore hangouts <span aria-hidden="true">↓</span></a>
          <div className="hero-decoration" aria-hidden="true"><span>Say hello.</span><div className="orbit"><img src="/anteater.svg" alt="" width="132" height="132" /></div><span>Go do something.</span></div>
        </section>

        <section className="activities" id="hangouts" aria-labelledby="hangouts-title">
          <div className="section-heading"><div><p className="eyebrow">AROUND CAMPUS</p><h2 id="hangouts-title">Find a hangout</h2></div><p className="joined-count" aria-live="polite">{joinedIds.length} joined</p></div>
          <div className="filters" aria-label="Filter hangouts by category">
            {categories.map((item) => <button key={item} type="button" className={category === item ? "filter selected" : "filter"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className="cards">
            {visibleHangouts.map((hangout) => {
              const joined = joinedIds.includes(hangout.id);
              return (
                <article className="card" key={hangout.id}>
                  <div className={`card-art ${hangout.category.toLowerCase()}`} aria-hidden="true"><span>{symbols[hangout.category]}</span><p>{hangout.category}</p></div>
                  <div className="card-body">
                    <p className="time">{hangout.time}</p>
                    <h3>{hangout.title}</h3>
                    <p className="location"><span aria-hidden="true">⌖</span> {hangout.location}</p>
                    <p className="description">{hangout.description}</p>
                    <div className="card-footer"><span>{hangout.participants + (joined ? 1 : 0)}/{hangout.capacity} going</span><button type="button" className={joined ? "join joined" : "join"} aria-pressed={joined} aria-label={`${joined ? "Leave" : "Join"} ${hangout.title}`} onClick={() => toggleJoin(hangout.id, hangout.title)}>{joined ? "Joined ✓" : "Join hangout"}</button></div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="notice" role="status">{notice || "Pick a plan. Make a connection."}</p>
        </section>
      </main>
      <footer><span>anteract · A little more connected.</span><span>Demo: sample activities. Joins reset on refresh.</span></footer>
    </>
  );
}
