import { AccountSafety } from "@/components/account-safety";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hangouts, people, symbols } from "@/lib/hangouts";

export function generateStaticParams() { return people.map((person) => ({ id: person.id })); }

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  const hosted = hangouts.filter((event) => event.hostId === person.id);
  return <div className="profile-page"><Link className="back-link" href="/events">← Browse events</Link>
    <section className="profile-card"><div className={`profile-cover ${person.color}`}><span aria-hidden="true">✦</span><span>GOOD COMPANY STARTS HERE</span></div><div className="profile-body"><div className="profile-heading"><span className={`avatar profile-avatar ${person.color}`}>{person.initials}</span><AccountSafety key={person.id} person={person} showChat /></div><p className="eyebrow">MEET AN ANTEATER · DEMO PROFILE</p><h1>{person.name}</h1><p className="profile-meta">{person.major} <span>·</span> {person.year}</p><h2>A little about me</h2><p className="body-copy">{person.bio}</p><h2>Things we could have in common</h2><div className="interest-tags">{person.interests.map((interest) => <span key={interest}>{interest}</span>)}</div></div></section>
    <section className="profile-events"><div className="section-heading"><div><p className="eyebrow">MAKE A PLAN TOGETHER</p><h2>{person.name.split(" ")[0]}’s hangouts</h2></div></div>{hosted.length ? hosted.map((event) => <Link className="profile-event-row" key={event.id} href={`/events/${event.id}`}><span className={`agenda-icon ${event.category.toLowerCase()}`} aria-hidden="true">{symbols[event.category]}</span><span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span><span className="row-arrow" aria-hidden="true">↗</span></Link>) : <p className="body-copy">No hosted hangouts yet. Say hello or find a shared activity.</p>}</section>
  </div>;
}
