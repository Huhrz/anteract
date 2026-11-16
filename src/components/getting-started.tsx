"use client";

import Link from "next/link";
import { guideSteps } from "@/lib/getting-started";
import { useGettingStarted } from "./getting-started-provider";

export function GettingStarted({ alwaysOpen = false }: { alwaysOpen?: boolean }) {
  const { ready, progress, persistent, setDismissed } = useGettingStarted();
  const completed = guideSteps.filter(step => progress[step.id]).length;
  const nextStep = guideSteps.find(step => !progress[step.id])?.id;

  if (!alwaysOpen && progress.dismissed) return <section className="quick-start quick-start-collapsed" aria-label="Quick start">
    <div><p className="eyebrow">AT YOUR OWN PACE</p><h2>Make yourself at home.</h2><p>Your quick start is here whenever you need it.</p></div>
    <button className="secondary" type="button" onClick={() => setDismissed(false)}>Show quick start <span aria-hidden="true">↗</span></button>
  </section>;

  return <section className="quick-start" aria-labelledby="quick-start-title" aria-busy={!ready}>
    <div className="quick-start-heading">
      <div><p className="eyebrow">A GOOD PLACE TO START</p><h2 id="quick-start-title">{completed === guideSteps.length ? "Your next hello is out there." : "Your first campus plan."}</h2><p>{completed === guideSteps.length ? "You know your way around. Keep exploring, or bring a plan of your own." : "A few small steps. A little more connected. Go in any order."}</p></div>
      <span className="quick-start-count" role="status">{ready ? `${completed} of ${guideSteps.length} complete` : "Getting things ready…"}</span>
    </div>
    <div className="quick-start-progress" role="progressbar" aria-label="Quick start progress" aria-valuemin={0} aria-valuemax={guideSteps.length} aria-valuenow={completed}><span style={{ width: `${completed / guideSteps.length * 100}%` }} /></div>
    <ol className="quick-start-steps">{guideSteps.map((step, index) => <li key={step.id} className={`${progress[step.id] ? "is-complete" : ""} ${step.id === nextStep ? "is-next" : ""}`}>
      <Link href={step.href}>
        <div className="quick-start-step-heading"><span className="quick-start-number" aria-hidden="true">{progress[step.id] ? "✓" : `0${index + 1}`}</span><span className="quick-start-step-status">{progress[step.id] ? "Complete" : step.id === nextStep ? "Try this next" : "At your pace"}</span></div>
        <h3>{step.title}</h3><p>{step.description}</p><span className="quick-start-action">{step.action}<span aria-hidden="true">↗</span></span>
      </Link>
    </li>)}</ol>
    <div className="quick-start-footer"><Link className="text-link" href="/help">A little help &amp; tips <span aria-hidden="true">↗</span></Link>{!alwaysOpen && <button className="quiet-button" type="button" disabled={!ready} onClick={() => setDismissed(true)}>{completed === guideSteps.length ? "All set. Keep exploring." : "I’ll explore on my own"}</button>}</div>
    {!persistent && <p className="small-note" role="status">Your progress is saved for this visit only.</p>}
  </section>;
}
