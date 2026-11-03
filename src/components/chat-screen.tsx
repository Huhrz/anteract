"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { people, type Person } from "@/lib/hangouts";
import { AccountSafety } from "./account-safety";
import { useDemo } from "./demo-provider";

function messageTime(value: string, compact = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return compact && date.toDateString() !== new Date().toDateString()
    ? date.toLocaleDateString([], { month: "short", day: "numeric" })
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function Avatar({ person }: { person: Person }) {
  return <span className={`avatar ${person.color}`} aria-hidden="true">{person.initials}</span>;
}

// The existing local store contains outgoing messages only. Direction is explicit
// so incoming bubbles can use the same presentation when delivery is connected.
function MessageBubble({ text, sentAt, outgoing = true }: { text: string; sentAt: string; outgoing?: boolean }) {
  return <div className={`message-row ${outgoing ? "outgoing" : "incoming"}`}>
    <div className="message-bubble"><span className="sr-only">{outgoing ? "You: " : "Recipient: "}</span><p>{text}</p></div>
    <time dateTime={sentAt} title={new Date(sentAt).toLocaleString()}>{messageTime(sentAt)}</time>
  </div>;
}

export function ChatScreen({ person }: { person?: Person }) {
  const { storageError } = useDemo();
  const [query, setQuery] = useState("");
  return <section className={`messenger chat-layout ${person ? "has-active-chat" : ""}`} aria-label="Messages">
    <aside className="chat-sidebar" aria-label="Conversations">
      <header className="messenger-heading"><h1>Messages<span className="gold-dot">.</span></h1><Link href="/friends#my-friends" className="messenger-new" aria-label="Find a friend to message" title="Find a friend to message">＋</Link></header>
      <label className="conversation-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg><span className="sr-only">Search conversations by name</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search conversations" /></label>
      <ConversationList person={person} query={query} />
      <p className="messenger-local-note">Local demo · Saved on this browser</p>
    </aside>
    {person ? <ActiveChat key={person.id} person={person} /> : <div className="chat-panel messenger-welcome"><span className="messenger-welcome-icon" aria-hidden="true">↗</span><h2>Your next hello starts here</h2><p>Choose a conversation or visit a friend’s profile to start one.</p><Link className="secondary" href="/friends#my-friends">Find your friends</Link></div>}
    {storageError && <p className="sr-only" role="alert">Browser storage is unavailable. Messages will be lost on refresh.</p>}
  </section>;
}

function ConversationList({ person, query }: { person?: Person; query: string }) {
  const { state, ready } = useDemo();
  const conversations = people.filter(contact => state.conversations[contact.id]?.length || contact.id === person?.id)
    .sort((a, b) => Date.parse(state.conversations[b.id]?.at(-1)?.sentAt ?? "1970-01-01") - Date.parse(state.conversations[a.id]?.at(-1)?.sentAt ?? "1970-01-01"));
  const matches = conversations.filter(contact => contact.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <nav className="conversation-list" aria-label="Message conversations" aria-busy={!ready}>
    {!ready ? <div className="conversation-placeholder" role="status">Loading conversations…</div> : !matches.length ? <div className="conversation-placeholder" role="status"><strong>{query.trim() ? "No conversations found" : "No conversations yet"}</strong><p>{query.trim() ? "Try another name." : "Open a friend’s profile to say hello."}</p>{query.trim() && <p>Search only includes your conversations.</p>}</div> : matches.map(contact => {
      const latest = state.conversations[contact.id]?.at(-1);
      return <Link className={`conversation ${contact.id === person?.id ? "active" : ""}`} key={contact.id} href={`/chat/${contact.id}`} scroll={false} aria-current={contact.id === person?.id ? "page" : undefined}>
        <Avatar person={contact} /><span className="conversation-copy"><span className="conversation-topline"><strong>{contact.name}</strong>{latest && <time dateTime={latest.sentAt} title={new Date(latest.sentAt).toLocaleString()}>{messageTime(latest.sentAt, true)}</time>}</span><small>{state.blockedAccounts.includes(contact.id) ? "Blocked account" : latest ? `You: ${latest.text}` : "Start a conversation"}</small></span>
      </Link>;
    })}
  </nav>;
}

function ActiveChat({ person }: { person: Person }) {
  const { state, ready, dispatch, storageError } = useDemo();
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [showLatest, setShowLatest] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const followLatest = useRef(true);
  const blocked = state.blockedAccounts.includes(person.id);
  const messages = state.conversations[person.id] ?? [];

  function scrollToLatest() {
    const element = thread.current;
    if (element) element.scrollTop = element.scrollHeight;
    followLatest.current = true;
    setShowLatest(false);
  }
  useEffect(() => {
    if (followLatest.current) scrollToLatest();
    else setShowLatest(true);
  }, [messages.length, ready]);
  useEffect(() => {
    const element = thread.current;
    if (!element) return;
    const observer = new ResizeObserver(() => { if (followLatest.current) element.scrollTop = element.scrollHeight; });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { setDraft(""); setNotice(""); }, [blocked]);
  useEffect(() => {
    if (!composer.current) return;
    composer.current.style.height = "auto";
    composer.current.style.height = `${Math.min(composer.current.scrollHeight, 128)}px`;
  }, [draft]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!ready || blocked || !text || text.length > 1000) return;
    dispatch({ type: "message", personId: person.id, message: { id: crypto.randomUUID(), text, sentAt: new Date().toISOString() } });
    setDraft("");
    setNotice("Message saved locally. Nothing was sent to another person.");
    composer.current?.focus();
  }

  return <div className="chat-panel">
    <header className="chat-header">
      <Link href="/chat" className="chat-mobile-back" aria-label="Back to conversations">←</Link>
      <Link className="host-line large chat-recipient" href={`/profiles/${person.id}`}><Avatar person={person} /><span><strong>{person.name}</strong><small>View profile <span aria-hidden="true">↗</span></small></span></Link>
      <AccountSafety key={person.id} person={person} />
    </header>
    <p className="chat-demo-note">Local demo · Messages stay in this browser. No real messages are delivered.</p>
    <div className="message-thread" ref={thread} tabIndex={0} role="log" aria-label={`Conversation with ${person.name}`} aria-live="polite" aria-relevant="additions" aria-busy={!ready} onScroll={() => {
      const element = thread.current;
      if (!element) return;
      followLatest.current = element.scrollHeight - element.scrollTop - element.clientHeight < 64;
      if (followLatest.current) setShowLatest(false);
    }}>
      {!ready ? <p className="conversation-placeholder" role="status">Loading conversation…</p> : messages.length ? messages.map((message, index) => {
        const previous = messages[index - 1];
        const newDay = !previous || new Date(previous.sentAt).toDateString() !== new Date(message.sentAt).toDateString();
        return <div className="message-entry" key={message.id}>{newDay && <div className="message-day"><time dateTime={message.sentAt}>{new Date(message.sentAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</time></div>}<MessageBubble text={message.text} sentAt={message.sentAt} /></div>;
      }) : <div className="chat-empty"><Avatar person={person} /><h2>Say hello to {person.name.split(" ")[0]}</h2><p>This is the start of your conversation.</p><button className="suggestion" type="button" disabled={!ready || blocked} onClick={() => { setDraft("Hey! Looking forward to the hangout. Where should we meet?"); composer.current?.focus(); }}>Hey! Where should we meet? <span aria-hidden="true">↗</span></button></div>}
    </div>
    {showLatest && <button className="chat-jump" type="button" onClick={scrollToLatest}>Jump to latest <span aria-hidden="true">↓</span></button>}
    <div className="chat-composer">
      <form className="message-form" onSubmit={send}>
        <label className="sr-only" htmlFor="message">Message {person.name}</label>
        <textarea ref={composer} id="message" name="message" rows={1} placeholder={blocked ? "Unblock this account to message" : `Message ${person.name.split(" ")[0]}…`} maxLength={1000} disabled={!ready || blocked} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
        }} />
        <button className="primary" type="submit" aria-label="Send message" disabled={!ready || blocked || !draft.trim()}>Send <span aria-hidden="true">↑</span></button>
      </form>
      <p className="chat-status" role="status">{storageError ? "Browser storage unavailable. Messages will be lost on refresh." : blocked ? "Account blocked. Unblock to send messages." : notice || "Enter to send · Shift+Enter for a new line"}</p>
    </div>
  </div>;
}
