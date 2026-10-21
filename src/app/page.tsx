"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [notice, setNotice] = useState("");
  function changeMode(next: typeof mode) { setMode(next); setNotice(""); }

  return <div className="welcome-page">
    <section className="welcome-story story-social" aria-labelledby="page-title">
      <Link className="welcome-brand" href="/" aria-label="Anteract home"><span><img src="/anteater.svg" alt="" width="36" height="36" /></span>anteract<span className="brand-period">.</span></Link>
      <div className="social-stage">
        <div className="social-collage" aria-label="New friends, coffee plans, and adventures">
          <div className="social-coast"><img src="/coast.jpg" alt="An afternoon on the California coast" /><span aria-hidden="true">⌖</span></div>
          <div className="social-friends"><img src="/campus-friends.jpg" alt="Students laughing together in a library" /><div className="social-progress" aria-hidden="true"><i /><i /><i /></div><div className="social-story-caption">Better<br />together.</div><div className="social-reply" aria-hidden="true"><span /><i /><i /></div></div>
          <div className="social-coffee"><span className="social-coffee-icon" aria-hidden="true">☕</span><img src="/coffee.jpg" alt="Coffee for a break between classes" /><span className="social-card-line" /><span className="social-card-line short" /></div>
          <div className="social-portrait"><img src="/student-portrait.jpg" alt="A smiling student" /></div>
          <span className="social-smile" aria-hidden="true">☀</span>
          <span className="social-heart" aria-hidden="true">♥</span>
          <span className="social-plan">Coffee? <span aria-hidden="true">↗</span></span>
        </div>
        <h1 className="social-headline" id="page-title">Find<br />the<br />people<br /><span>you click<br />with.</span></h1>
      </div>
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
