"use client";

import Link from "next/link";
import { useDemo } from "@/components/demo-provider";
import { people } from "@/lib/hangouts";

export default function Messages() {
  const { state, ready } = useDemo();
  return <section className="friends-page">
    <div className="page-heading"><p className="eyebrow">A LITTLE HELLO GOES A LONG WAY</p><h1>Messages<span className="gold-dot">.</span></h1><p className="intro">A shared plan is a good icebreaker.</p></div>
    <p className="small-note">Demo conversations · Messages stay in this browser.</p>
    <div className="friend-list">{people.map(person => <Link className="friend-card" key={person.id} href={`/chat/${person.id}`}><span className="friend-identity"><span className={`avatar ${person.color}`}>{person.initials}</span><span><strong>{person.name}</strong><small>{!ready ? "Loading…" : state.blockedAccounts.includes(person.id) ? "Blocked account" : state.conversations[person.id]?.at(-1)?.text ?? "Start a conversation"}</small></span></span><span aria-hidden="true">↗</span></Link>)}</div>
  </section>;
}
