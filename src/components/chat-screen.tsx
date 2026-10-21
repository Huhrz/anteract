"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { people, type Person } from "@/lib/hangouts";
import { AccountSafety } from "./account-safety";
import { useDemo } from "./demo-provider";

export function ChatScreen({ person }: { person: Person }) {
  const { state, ready, dispatch } = useDemo();
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const thread = useRef<HTMLDivElement>(null);
  const blocked = state.blockedAccounts.includes(person.id);
  const messages = state.conversations[person.id] ?? [];
  useEffect(() => { if (thread.current) thread.current.scrollTop = thread.current.scrollHeight; }, [messages.length]);
  // Avoid carrying an unsent message to another person's conversation.
  useEffect(() => { setDraft(""); setNotice(""); }, [person.id, blocked]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!ready || blocked || !text || text.length > 1000) return;
    dispatch({ type: "message", personId: person.id, message: { id: crypto.randomUUID(), text, sentAt: new Date().toISOString() } });
    setDraft("");
    setNotice("Message saved locally. This is a demo; nothing was sent to another person.");
  }

  return <div className="chat-page"><Link className="back-link" href={`/profiles/${person.id}`}>← Back to {person.name.split(" ")[0]}’s profile</Link>
    <section className="chat-layout" aria-label="Chat">
      <aside className="chat-sidebar"><p className="eyebrow">SAY HELLO</p><h2>Messages<span className="gold-dot">.</span></h2><p className="small-note">A shared plan is a good icebreaker.</p><div className="conversation-list">{people.map((contact) => <Link className={contact.id === person.id ? "conversation active" : "conversation"} key={contact.id} href={`/chat/${contact.id}`} aria-current={contact.id === person.id ? "page" : undefined}><span className={`avatar ${contact.color}`}>{contact.initials}</span><span><strong>{contact.name}</strong><small>{state.blockedAccounts.includes(contact.id) ? "Blocked account" : state.conversations[contact.id]?.at(-1)?.text ?? "Start a conversation"}</small></span></Link>)}</div><Link className="text-link" href="/my-events">My events →</Link></aside>
      <div className="chat-panel"><header className="chat-header"><Link className="host-line large" href={`/profiles/${person.id}`}><span className={`avatar ${person.color}`}>{person.initials}</span><span><strong>{person.name}</strong><small>View profile →</small></span></Link><AccountSafety key={person.id} person={person} /></header><p className="chat-demo-note">Messages stay in this browser. No real messages are delivered.</p>
        <div className="message-thread" ref={thread} role="log" aria-label={`Conversation with ${person.name}`} aria-live="polite">{!ready ? <p className="small-note">Loading conversation…</p> : messages.length ? messages.map((message) => <div className="message-row" key={message.id}><div className="message-bubble"><span className="sr-only">You: </span><p>{message.text}</p></div><small>You · {new Date(message.sentAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · Saved locally</small></div>) : <div className="chat-empty"><span className={`avatar big ${person.color}`}>{person.initials}</span><h2>Say hello to {person.name.split(" ")[0]}.</h2><p>Ask about the meeting spot,<br />or start with something you have in common.</p><button className="suggestion" type="button" disabled={!ready || blocked} onClick={() => setDraft("Hey! Looking forward to the hangout. Where should we meet?")}>“Hey! Where should we meet?” ↗</button></div>}</div>
        <form className="message-form" onSubmit={send}><label className="sr-only" htmlFor="message">Message {person.name}</label><input id="message" name="message" placeholder={`Message ${person.name.split(" ")[0]}…`} autoComplete="off" maxLength={1000} disabled={!ready || blocked} value={draft} onChange={(event) => setDraft(event.target.value)} /><button className="primary" type="submit" disabled={!ready || blocked || !draft.trim()}>Send <span aria-hidden="true">↑</span></button></form><p className="chat-status" role="status">{blocked ? "Account blocked. Unblock to send messages. Shared events are not affected." : notice || "Demo only · Your conversation is saved on this device."}</p>
      </div>
    </section>
  </div>;
}
