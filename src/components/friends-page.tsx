"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { guestModeEnabled } from "@/lib/guest-mode";
import { guestPeople } from "@/lib/guest-people";
import { guestUserId } from "@/lib/guest-state";
import { useGuest } from "./guest-provider";
import { createClient } from "@/lib/supabase/client";
import { profileInitials } from "@/lib/profile";

type Profile = { id: string; display_name: string; major: string; class_year: string; interests: string[]; avatar_path: string | null };
type FriendRequest = { id: string; sender_id: string; recipient_id: string; status: "pending" | "accepted" | "rejected"; created_at: string };
type ProfileWithPhoto = Profile & { photoUrl: string };

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Could not load friends. Please try again.";
}

export default function FriendsPage() {
  const guest = useGuest();
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileWithPhoto>>({});
  const [results, setResults] = useState<ProfileWithPhoto[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error("Please log in to view friend requests.");
    setUserId(user.id);
    const { data, error: queryError } = await supabase.from("friend_requests")
      .select("id, sender_id, recipient_id, status, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });
    if (queryError) throw queryError;
    const rows = (data ?? []) as FriendRequest[];
    setRequests(rows);
    const ids = [...new Set(rows.flatMap((row) => [row.sender_id, row.recipient_id]).filter((id) => id !== user.id))];
    if (!ids.length) { setProfiles({}); return; }
    const { data: people, error: profileError } = await supabase.from("profiles")
      .select("id, display_name, major, class_year, interests, avatar_path")
      .in("id", ids);
    if (profileError) throw profileError;
    const mapped: Record<string, ProfileWithPhoto> = {};
    for (const profile of (people ?? []) as Profile[]) {
      let photoUrl = "";
      if (profile.avatar_path) {
        const { data: photo, error: photoError } = await supabase.storage.from("profile-photos").createSignedUrl(profile.avatar_path, 3600);
        if (photoError) throw photoError;
        photoUrl = photo.signedUrl;
      }
      mapped[profile.id] = { ...profile, photoUrl };
    }
    setProfiles(mapped);
  }, []);

  useEffect(() => {
    if (guestModeEnabled) {
      if (!guest.ready) return;
      setUserId(guestUserId); setRequests(guest.state.requests);
      setProfiles(Object.fromEntries(guestPeople.map((profile) => [profile.id, profile])));
      setLoading(false); return;
    }
    let active = true;
    void refresh().catch((loadError: unknown) => { if (active) setError(getErrorMessage(loadError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh, guest.ready, guest.state.requests]);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setResults([]);
    try {
      if (guestModeEnabled) {
        const term = query.trim().toLowerCase();
        setResults(term ? guestPeople.filter((profile) => profile.display_name.toLowerCase().includes(term)) : []); return;
      }
      const supabase = createClient();
      const term = query.trim();
      if (!term) { setResults([]); return; }
      const escaped = term.replace(/[%_,()]/g, " ").trim();
      if (!escaped) { setResults([]); return; }
      const { data, error: searchError } = await supabase.from("profiles")
        .select("id, display_name, major, class_year, interests, avatar_path")
        .neq("id", userId)
        .ilike("display_name", `%${escaped}%`)
        .limit(30);
      if (searchError) throw searchError;
      const found: ProfileWithPhoto[] = [];
      for (const profile of (data ?? []) as Profile[]) {
        let photoUrl = "";
        if (profile.avatar_path) {
          const { data: photo, error: photoError } = await supabase.storage.from("profile-photos").createSignedUrl(profile.avatar_path, 3600);
          if (photoError) throw photoError;
          photoUrl = photo.signedUrl;
        }
        found.push({ ...profile, photoUrl });
      }
      setResults(found);
    } catch (searchError) {
      setError(getErrorMessage(searchError));
    }
  }

  async function respond(request: FriendRequest, accept: boolean) {
    setBusyId(request.id);
    setError("");
    setNotice("");
    try {
      if (guestModeEnabled) { guest.act({ type: "respond", requestId: request.id, accept }); setNotice("Invitation updated in this browser demo."); return; }
      const { data, error: updateError } = await createClient().from("friend_requests")
        .update({ status: accept ? "accepted" : "rejected" }).eq("id", request.id).select("id").maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new Error("This friend request is no longer pending. Refresh and try again.");
      await refresh();
      setNotice(accept ? "Friend request accepted." : "Friend request declined.");
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId("");
    }
  }

  async function invite(profile: ProfileWithPhoto) {
    setBusyId(profile.id);
    setError("");
    setNotice("");
    try {
      if (guestModeEnabled) { guest.act({ type: "invite", request: { id: crypto.randomUUID(), sender_id: guestUserId, recipient_id: profile.id, status: "pending", created_at: new Date().toISOString() } }); setNotice("Friend request saved in this browser demo."); return; }
      const { error: insertError } = await createClient().from("friend_requests")
        .insert({ sender_id: userId, recipient_id: profile.id });
      if (insertError) throw insertError;
      await refresh();
      setNotice(`Friend request sent to ${profile.display_name}.`);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId("");
    }
  }

  const incoming = requests.filter((request) => request.status === "pending" && request.recipient_id === userId);
  const outgoing = requests.filter((request) => request.status === "pending" && request.sender_id === userId);
  const friends = requests.filter((request) => request.status === "accepted");
  const friendsLoaded = !loading && !error;

  function personCard(profile: ProfileWithPhoto, action?: React.ReactNode) {
    return <article className="friend-card" key={profile.id}>
      <Link className="friend-identity" href={`/profiles/${profile.id}`}>
        <span className="avatar friend-avatar">{profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : profileInitials(profile.display_name)}</span>
        <span><strong>{profile.display_name}</strong><small>{[profile.major, profile.class_year].filter(Boolean).join(" · ") || "UCI student"}</small></span>
      </Link>
      {action}
    </article>;
  }

  if (loading) return <section className="page-heading"><p role="status">Loading your friends…</p></section>;
  return <div className="friends-page">
    <section className="page-heading"><p className="eyebrow">YOUR ANTERACT COMMUNITY</p><h1>Friends<span className="gold-dot">.</span></h1><p className="intro">Find your people, one friendly hello at a time.</p></section>
    {error && <p className="entry-notice" role="alert">{error}</p>}
    {notice && <p className="entry-notice" role="status">{notice}</p>}
    <section className="friend-section friend-inbox" aria-labelledby="friend-requests-heading">
      <div className="section-heading"><div><p className="eyebrow">SAY HELLO BACK</p><h2 id="friend-requests-heading">Invitations <span className="nav-count">{incoming.length}</span></h2></div></div>
      {incoming.length ? <div className="friend-list">{incoming.map((request) => {
        const profile = profiles[request.sender_id];
        return profile ? personCard(profile, <div className="friend-actions"><button className="primary" type="button" disabled={busyId === request.id} onClick={() => void respond(request, true)}>Accept</button><button className="quiet-button" type="button" disabled={busyId === request.id} onClick={() => void respond(request, false)}>Decline</button></div>) : null;
      })}</div> : friendsLoaded ? <p className="body-copy">No new invitations right now. Requests you receive will show up here.</p> : null}
    </section>
    <section className="friend-section">
      <div className="section-heading"><div><p className="eyebrow">NEW CONNECTIONS</p><h2>Find UCI students</h2></div></div>
      <form className="friend-search" onSubmit={(event) => void search(event)}>
        <label htmlFor="friend-search">Search by name</label>
        <div><input id="friend-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a name…" /><button className="primary" type="submit">Search</button></div>
      </form>
      {results.length > 0 && <div className="friend-list">{results.map((profile) => {
        const existing = requests.find((request) => (request.sender_id === profile.id && request.recipient_id === userId) || (request.sender_id === userId && request.recipient_id === profile.id));
        const incomingRequest = existing?.status === "pending" && existing.sender_id === profile.id;
        const action = existing?.status === "accepted" ? <span className="friend-state">✓ Friends</span>
          : existing?.status === "pending" ? incomingRequest
            ? <div className="friend-actions"><button className="primary" type="button" disabled={busyId === existing.id} onClick={() => void respond(existing, true)}>Accept</button><button className="quiet-button" type="button" disabled={busyId === existing.id} onClick={() => void respond(existing, false)}>Decline</button></div>
            : <span className="friend-state">Request sent</span>
          : <button className="primary" type="button" disabled={busyId === profile.id} onClick={() => void invite(profile)}>{busyId === profile.id ? "Sending…" : "Add friend"}</button>;
        return personCard(profile, action);
      })}</div>}
      {query.trim() && !results.length && <p className="body-copy">No matches found. Try another name.</p>}
    </section>
    {outgoing.length > 0 && <section className="friend-section"><div className="section-heading"><div><p className="eyebrow">OUT THERE</p><h2>Sent requests</h2></div></div><div className="friend-list">{outgoing.map((request) => {
      const profile = profiles[request.recipient_id];
      return profile ? personCard(profile, <span className="friend-state">Request sent</span>) : null;
    })}</div></section>}
    <section className="friend-section"><div className="section-heading"><div><p className="eyebrow">YOUR PEOPLE</p><h2>Friends · {friends.length}</h2></div></div>
      {friends.length ? <div className="friend-list">{friends.map((request) => {
        const id = request.sender_id === userId ? request.recipient_id : request.sender_id;
        const profile = profiles[id];
        return profile ? personCard(profile, <span className="friend-state">✓ Friends</span>) : null;
      })}</div> : <p className="body-copy">Your friend list is just getting started. Search for a UCI student above to send your first request.</p>}
    </section>
  </div>;
}
