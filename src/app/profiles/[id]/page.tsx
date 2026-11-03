import { guestModeEnabled } from "@/lib/guest-mode";
import { GuestProfile } from "@/components/guest-profile";
import { AccountSafety } from "@/components/account-safety";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hangouts, people, symbols } from "@/lib/hangouts";
import { createClient } from "@/lib/supabase/server";
import { profilePhotoBucket } from "@/lib/profile";
import { ProfileCard } from "@/components/profile-card";
import { FriendRequestButton } from "@/components/friend-request-button";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (guestModeEnabled) return <GuestProfile id={id} />;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    const supabase = await createClient();
    const [{ data: { user }, error: authError }, { data: profile, error: profileError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    ]);
    if (authError || profileError) throw authError ?? profileError;
    if (!profile) notFound();
    let photoUrl = "";
    if (profile.avatar_path) {
      const { data, error } = await supabase.storage.from(profilePhotoBucket).createSignedUrl(profile.avatar_path, 3600);
      if (error) throw error;
      photoUrl = data.signedUrl;
    }
    return <div className="profile-page">
      <ProfileCard publicView name={profile.display_name} major={profile.major} year={profile.class_year} bio={profile.bio ?? ""} interests={profile.interests} photoUrl={photoUrl} socialLinks={profile.social_links ?? []} actions={user?.id === profile.id ? <Link className="secondary" href="/profile">Edit profile</Link> : <FriendRequestButton profileId={profile.id} name={profile.display_name} />} />
    </div>;
  }
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  const hosted = hangouts.filter((event) => event.hostId === person.id);
  return <div className="profile-page">
    <ProfileCard publicView name={person.name} major={person.major} year={person.year} bio={person.bio} interests={person.interests} photoUrl="" socialLinks={[]} actions={<AccountSafety key={person.id} person={person} showChat />} />
    <section className="profile-events"><div className="section-heading"><div><p className="eyebrow">MAKE A PLAN TOGETHER</p><h2>{person.name.split(" ")[0]}’s hangouts</h2></div></div>{hosted.length ? hosted.map((event) => <Link className="profile-event-row" key={event.id} href={`/events/${event.id}`}><span className={`agenda-icon ${event.category.toLowerCase()}`} aria-hidden="true">{symbols[event.category]}</span><span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span><span className="row-arrow" aria-hidden="true">↗</span></Link>) : <p className="body-copy">No hosted hangouts yet. Say hello or find a shared activity.</p>}</section>
  </div>;
}
