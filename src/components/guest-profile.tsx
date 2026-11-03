"use client";

import Link from "next/link";
import { people } from "@/lib/hangouts";
import { guestUserId } from "@/lib/guest-state";
import { profileInitials } from "@/lib/profile";
import { useGuest } from "./guest-provider";
import { useEvents } from "./event-provider";
import { FriendRequestButton } from "./friend-request-button";
import { ProfileSocialLinks } from "./profile-social-links";
import { AccountSafety } from "./account-safety";

export function GuestProfile({ id }: { id: string }) {
  const guest = useGuest();
  const { events } = useEvents();
  if (!guest.ready) return <p className="loading-state" role="status">Loading profile…</p>;
  const own = id === guestUserId;
  const person = people.find((item) => item.id === id);
  if (!own && !person) return <section className="empty-state"><h1>Profile not found</h1><Link href="/friends" className="primary">Find sample students</Link></section>;
  const name = own ? guest.state.profile.display_name : person!.name;
  const interests = own ? guest.state.profile.interests : person!.interests;
  return <div className="profile-page"><Link className="back-link" href="/events">← Browse events</Link>
    <section className="profile-card"><div className="profile-cover blue"><span aria-hidden="true">✦</span><span>GOOD COMPANY STARTS HERE</span></div><div className="profile-body">
      <div className="profile-heading"><span className="avatar profile-avatar blue">{own && guest.state.profile.photoUrl ? <img src={guest.state.profile.photoUrl} alt="" /> : profileInitials(name)}</span>{own ? <Link className="secondary" href="/profile">Edit profile</Link> : <FriendRequestButton profileId={id} name={name} />}</div>
      <p className="eyebrow">GUEST DEMO PROFILE</p><h1>{name}</h1><p className="profile-meta">{own ? [guest.state.profile.major, guest.state.profile.class_year].filter(Boolean).join(" · ") : `${person!.major} · ${person!.year}`}</p>
      {own && guest.state.profile.bio && <><h2>A little about me</h2><p className="body-copy profile-bio">{guest.state.profile.bio}</p></>}
      {person && <><h2>A little about me</h2><p className="body-copy">{person.bio}</p><AccountSafety person={person} showChat /></>}
      <h2>Things we could have in common</h2><div className="interest-tags">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
      <ProfileSocialLinks links={own ? guest.state.profile.social_links : undefined} />
    </div></section>
    <section className="profile-events"><h2>{own ? "Your plans" : `${name.split(" ")[0]}’s hangouts`}</h2>{events.filter((event) => event.hostId === id).map((event) => <Link key={event.id} className="profile-event-row" href={`/events/${event.id}`}><span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span><span>↗</span></Link>)}</section>
  </div>;
}
