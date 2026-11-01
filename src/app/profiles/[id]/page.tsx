import { guestModeEnabled } from "@/lib/guest-mode";
import { ProfileSocialLinks } from "@/components/profile-social-links";
import { GuestProfile } from "@/components/guest-profile";
import { AccountSafety } from "@/components/account-safety";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hangouts, people, symbols } from "@/lib/hangouts";
import { createClient } from "@/lib/supabase/server";
import { profileInitials, profilePhotoBucket } from "@/lib/profile";
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
    return <div className="profile-page"><Link className="back-link" href="/events">← Browse events</Link>
      <section className="profile-card"><div className="profile-cover blue"><span aria-hidden="true">✦</span><span>GOOD COMPANY STARTS HERE</span></div><div className="profile-body">
        <div className="profile-heading"><span className="avatar profile-avatar blue">{photoUrl ? <img src={photoUrl} alt="" /> : profileInitials(profile.display_name)}</span>
          {user?.id === profile.id ? <Link className="secondary" href="/profile">Edit profile</Link> : <FriendRequestButton profileId={profile.id} name={profile.display_name} />}
        </div>
        <p className="eyebrow">UCI STUDENT</p><h1>{profile.display_name}</h1>
        {(profile.major || profile.class_year) && <p className="profile-meta">{[profile.major, profile.class_year].filter(Boolean).join(" · ")}</p>}
        <h2>Things we could have in common</h2>
        {profile.interests.length ? <div className="interest-tags">{profile.interests.map((interest: string) => <span key={interest}>{interest}</span>)}</div> : <p className="body-copy">No interests added yet.</p>}
        <ProfileSocialLinks links={profile.social_links} />
      </div></section>
    </div>;
  }
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  const hosted = hangouts.filter((event) => event.hostId === person.id);
  return <div className="profile-page"><Link className="back-link" href="/events">← Browse events</Link>
    <section className="profile-card"><div className={`profile-cover ${person.color}`}><span aria-hidden="true">✦</span><span>GOOD COMPANY STARTS HERE</span></div><div className="profile-body"><div className="profile-heading"><span className={`avatar profile-avatar ${person.color}`}>{person.initials}</span><AccountSafety key={person.id} person={person} showChat /></div><p className="eyebrow">MEET AN ANTEATER · DEMO PROFILE</p><h1>{person.name}</h1><p className="profile-meta">{person.major} <span>·</span> {person.year}</p><h2>A little about me</h2><p className="body-copy">{person.bio}</p><h2>Things we could have in common</h2><div className="interest-tags">{person.interests.map((interest) => <span key={interest}>{interest}</span>)}</div></div></section>
    <section className="profile-events"><div className="section-heading"><div><p className="eyebrow">MAKE A PLAN TOGETHER</p><h2>{person.name.split(" ")[0]}’s hangouts</h2></div></div>{hosted.length ? hosted.map((event) => <Link className="profile-event-row" key={event.id} href={`/events/${event.id}`}><span className={`agenda-icon ${event.category.toLowerCase()}`} aria-hidden="true">{symbols[event.category]}</span><span><strong>{event.title}</strong><small>{event.time} · {event.location}</small></span><span className="row-arrow" aria-hidden="true">↗</span></Link>) : <p className="body-copy">No hosted hangouts yet. Say hello or find a shared activity.</p>}</section>
  </div>;
}
