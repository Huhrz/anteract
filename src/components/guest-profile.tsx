"use client";

import Link from "next/link";
import { people } from "@/lib/hangouts";
import { guestUserId } from "@/lib/guest-state";
import { ProfileCard } from "./profile-card";
import { useGuest } from "./guest-provider";
import { useEvents } from "./event-provider";
import { FriendRequestButton } from "./friend-request-button";
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
  return <div className="profile-page">
    <ProfileCard publicView name={name} major={own ? guest.state.profile.major : person!.major} year={own ? guest.state.profile.class_year : person!.year} bio={own ? guest.state.profile.bio ?? "" : person!.bio} interests={interests} photoUrl={own ? guest.state.profile.photoUrl : ""} socialLinks={own ? guest.state.profile.social_links ?? [] : []} actions={own ? <Link className="secondary" href="/profile">Edit profile</Link> : <><FriendRequestButton profileId={id} name={name} /><AccountSafety person={person!} showChat /></>} />
    <section className="profile-events"><h2>{own ? "Your plans" : `${name.split(" ")[0]}’s hangouts`}</h2>{events.filter((event) => event.hostId === id).map((event) => <Link key={event.id} className="profile-event-row" href={`/events/${event.id}`}><span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span><span>↗</span></Link>)}</section>
  </div>;
}
