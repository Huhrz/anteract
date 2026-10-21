"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [notice, setNotice] = useState("");
  function changeMode(next: typeof mode) { setMode(next); setNotice(""); }

  return <div className="welcome-page">
    <section className="welcome-story" aria-labelledby="page-title">
      <Link className="welcome-brand" href="/" aria-label="Anteract home"><span><img src="/anteater.svg" alt="" width="36" height="36" /></span>anteract<span className="brand-period">.</span></Link>
      <div className="story-collage" aria-label="Shared moments, new friendships">
        <div className="sun-sticker" aria-hidden="true">✳</div>
        <div className="moment-card coast-moment"><img src="/coast.jpg" alt="Waves along the California coast" /><span className="moment-label">a little off-campus adventure ↗</span></div>
        <div className="moment-card friends-moment"><img src="/campus-friends.jpg" alt="Students spending an afternoon together outside" /><div className="story-progress"><i /><i /><i /></div><span className="photo-location">⌖ &nbsp; Better together</span><div className="photo-caption">Same campus.<br />New connections.</div></div>
        <div className="plan-sticker"><span className="plan-icon">☕</span><div><strong>Coffee between classes?</strong><span>Your next friendship starts here.</span></div><span className="plan-arrow">↗</span></div>
        <span className="hello-sticker">say hello! <span>↗</span></span>
        <div className="heart-sticker" aria-hidden="true">♡</div>
        <div className="zot-sticker"><img src="/anteater.svg" alt="" width="62" height="62" /><span>ZOT ZOT!</span></div>
      </div>
      <div className="welcome-headline"><p className="welcome-eyebrow">YOUR CAMPUS. YOUR PEOPLE.</p><h1 id="page-title">A little hello.<br />A whole lot of<br /><span>possibility.</span></h1><p>Find your study buddy, your adventure crew,<br />or someone who just gets you.</p></div>
    </section>
    <section className="welcome-entry" aria-labelledby="entry-title">
      <span className="uci-badge"><span>✦</span> EXCLUSIVELY UCI</span>
      <div className="entry-content">
        <p className="entry-kicker">GOOD TO SEE YOU HERE</p>
        <h2 id="entry-title">{mode === "signup" ? "Your people are here." : mode === "reset" ? "Let’s get you back in." : "Hello, Anteater."}<span> {mode === "login" ? "✳" : ""}</span></h2>
        <p className="entry-description">{mode === "signup" ? "A shared campus is a pretty good place to start." : mode === "reset" ? "Start with your UCI email address." : "Your next connection is just a hello away."}</p>
        <form className="welcome-form" onSubmit={(event) => { event.preventDefault(); setNotice("Account services aren’t connected yet. You can explore sample events below — no account needed."); }}>
          <label htmlFor="uci-email">UCI email address</label>
          <input id="uci-email" name="email" type="email" placeholder="you@uci.edu" autoComplete="email" required pattern="[^\s@]+@uci\.edu" title="Use your @uci.edu email address" />
          {mode !== "reset" && <><label htmlFor="password">Password</label><input id="password" name="password" type="password" placeholder={mode === "signup" ? "Create a password" : "Enter your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required /></>}
          <button className="welcome-submit" type="submit">{mode === "signup" ? "Create your account" : mode === "reset" ? "Reset password" : "Log in"}<span aria-hidden="true">↗</span></button>
          {notice && <p className="entry-notice" role="status">{notice}</p>}
        </form>
        <button className="forgot-link" onClick={() => changeMode(mode === "login" ? "reset" : "login")}>{mode === "login" ? "Forgot password?" : "Back to log in"}</button>
        <div className="entry-divider"><span /> <p>A NEW FACE ON CAMPUS?</p> <span /></div>
        <button className="welcome-create" onClick={() => changeMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "I already have an account" : "Find your people. Join Anteract."}</button>
      </div>
    </section>
  </div>;
}
