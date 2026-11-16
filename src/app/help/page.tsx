import Link from "next/link";
import { GettingStarted } from "@/components/getting-started";
import { EVENT_POINTS } from "@/lib/my-events";

const topics = [
  { id: "discover", label: "Find a plan" }, { id: "events", label: "Join & leave" },
  { id: "locations", label: "Meeting places" }, { id: "messages", label: "Say hello" },
  { id: "hosting", label: "Host a plan" }, { id: "points", label: "Event points" },
];

export default function Help() {
  return <div className="help-page">
    <header className="page-heading help-heading"><p className="eyebrow">A LITTLE HELP GOES A LONG WAY</p><h1>Good plans start here.</h1><p className="intro">Find your way around Anteract, from your first campus plan to your next hello.</p><Link className="text-link" href="/">← Back to home</Link></header>
    <GettingStarted alwaysOpen />
    <section className="help-topics" aria-labelledby="help-topics-title">
      <div className="section-heading"><div><p className="eyebrow">THE LITTLE THINGS, EXPLAINED</p><h2 id="help-topics-title">A few helpful tips.</h2></div></div>
      <nav className="help-topic-links" aria-label="Help topics">{topics.map(topic => <a key={topic.id} href={`#${topic.id}`}>{topic.label}</a>)}</nav>
      <div className="help-grid">
        <article className="help-card" id="discover"><span className="help-number" aria-hidden="true">01</span><h3>Find a plan that feels like you.</h3><p>Browse shows events that haven’t started yet. Search by title, location, or interest, then narrow things down with a category, date, or available spots.</p><p>Choosing multiple interest tags shows events that match all of them. No matches? Clear a filter or try a broader search.</p><Link className="text-link" href="/events">Explore events ↗</Link></article>
        <article className="help-card" id="events"><span className="help-number" aria-hidden="true">02</span><h3>A little yes. A new plan.</h3><p>Open an event to check the details, then choose Join event. Once your spot is saved, the plan appears in My Events. There’s no extra attendance confirmation step.</p><p>Plans changed? Open the event and choose Leave event. If you’re the organizer, Manage event lets you cancel it for everyone. Full or started events are closed to new joins.</p><Link className="text-link" href="/my-events">Find your plans ↗</Link></article>
        <article className="help-card" id="locations"><span className="help-number" aria-hidden="true">03</span><h3>Meet in the right place.</h3><p>Check the location and the organizer’s meeting instructions before you go. Show campus map opens a preview; Open UCI map gives you the full official map.</p><p>Some locations have an exact pin. Others open a building search, so use the meeting details to find the right entrance or gathering spot.</p><Link className="text-link" href="/events">Find somewhere to meet ↗</Link></article>
        <article className="help-card" id="messages"><span className="help-number" aria-hidden="true">04</span><h3>Start with a hello.</h3><p>Open a student’s profile and choose Send message. Messages are private conversations between two students. Joining an event doesn’t create a group chat.</p><p>You can message an accepted friend directly. For someone new, send one introductory message and wait for them to accept. Incoming introductions appear under Requests. Accept to reply, or decline if you’d rather not connect.</p><p>Report and Block are available from profiles and chats. Blocking stops messages in both directions; existing history remains available.</p><Link className="text-link" href="/friends#find-students">Find your people ↗</Link></article>
        <article className="help-card" id="hosting"><span className="help-number" aria-hidden="true">05</span><h3>Bring a plan of your own.</h3><p>Save your profile before hosting. Add a title, category, description, campus location, future date and time, and a group size. The organizer counts toward that group size.</p><p>Choose a location suggestion and check its map preview. Add a clear meeting point, such as “outside the main entrance.” Review your event before publishing; you’ll find it in My Events under Hosting.</p><p>You can publish up to three events per UTC day. Canceling a plan doesn’t restore that day’s posting allowance.</p><Link className="text-link" href="/events/new">Create an event ↗</Link></article>
        <article className="help-card" id="points"><span className="help-number" aria-hidden="true">06</span><h3>Your campus story adds up.</h3><p>Each event you joined or hosted adds {EVENT_POINTS} points once its start time has passed. A plan counts once, even if you’re both its organizer and a participant.</p><p>These points reflect your current event history, rather than a verified check-in. Leaving an event or having it canceled can change your total.</p><div className="help-tiers" aria-label="Event reward tiers"><span>Bronze <strong>100</strong></span><span>Silver <strong>200</strong></span><span>Gold <strong>350</strong></span></div><Link className="text-link" href="/my-events">See your event rewards ↗</Link></article>
      </div>
    </section>
    <div className="help-closing"><span aria-hidden="true">✳</span><div><h2>You don’t have to do it all at once.</h2><p>Start with one activity you’re into. Good company can follow.</p></div><Link className="primary" href="/events">Find your next plan ↗</Link></div>
  </div>;
}
