"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseInterests, profilePhotoBucket, profilePhotoMaxBytes, type Profile } from "@/lib/profile";

const years = ["First year", "Second year", "Third year", "Fourth year", "Graduate student", "Other"];

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
    return error.message;
  }
  return fallback;
}

export default function ProfileEditor() {
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Please log in to set up your profile.");
        const { data, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (profileError) throw profileError;
        let signedPhoto = "";
        if (data?.avatar_path) {
          const { data: signed, error: photoError } = await supabase.storage.from(profilePhotoBucket).createSignedUrl(data.avatar_path, 3600);
          if (photoError) throw photoError;
          signedPhoto = signed.signedUrl;
        }
        if (active) {
          setUserId(user.id);
          setProfile(data);
          setPhotoUrl(signedPhoto);
        }
      } catch (loadError) {
        if (active) setError(errorMessage(loadError, "Could not load your profile."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("display_name") ?? "").trim();
    const major = String(form.get("major") ?? "").trim();
    const classYear = String(form.get("class_year") ?? "");
    const interests = parseInterests(String(form.get("interests") ?? ""));
    if (displayName.length < 2 || displayName.length > 50) { setError("Display name must be between 2 and 50 characters."); return; }
    if (major.length > 100 || interests.length > 10 || interests.some((interest) => interest.length > 30)) {
      setError("Use up to 10 interests, each no longer than 30 characters. Major must be 100 characters or fewer.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    let uploadedPath: string | null = profile?.avatar_path ?? null;
    try {
      const supabase = createClient();
      if (photo) {
        const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
        uploadedPath = `${userId}/avatar.${extension}`;
        const { error: uploadError } = await supabase.storage.from(profilePhotoBucket).upload(uploadedPath, photo, { upsert: true, contentType: photo.type });
        if (uploadError) throw uploadError;
      }

      const updated = { id: userId, display_name: displayName, major, class_year: classYear, interests, avatar_path: uploadedPath };
      const { data, error: saveError } = await supabase.from("profiles").upsert(updated).select("*").single();
      if (saveError) throw saveError;

      let signedPhoto = "";
      if (data.avatar_path) {
        const { data: signed, error: photoError } = await supabase.storage.from(profilePhotoBucket).createSignedUrl(data.avatar_path, 3600);
        if (photoError) throw photoError;
        signedPhoto = signed.signedUrl;
      }
      setProfile(data);
      setPhotoUrl(signedPhoto);
      setPhoto(null);
      setNotice("Your profile is saved.");
    } catch (saveError) {
      setError(errorMessage(saveError, "Could not save your profile. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  function choosePhoto(file: File | undefined) {
    setError("");
    if (!file) { setPhoto(null); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > profilePhotoMaxBytes) {
      setError("Profile photos must be 5 MB or smaller.");
      return;
    }
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  if (loading) return <section className="page-heading"><p role="status">Loading your profile…</p></section>;
  const displayName = profile?.display_name ?? "";

  return <section className="profile-editor">
    <Link className="back-link" href="/">← Home</Link>
    <div className="page-heading"><p className="eyebrow">YOUR ANTERACT PROFILE</p><h1>Make it yours<span className="gold-dot">.</span></h1><p className="intro">Share a little about yourself so UCI students know who they might meet.</p></div>
    <form className="profile-form" onSubmit={save}>
      <div className="profile-photo-field">
        {photoUrl ? <img className="profile-photo-preview" src={photoUrl} alt="Profile photo preview" /> : <div className="profile-photo-placeholder" aria-hidden="true">{displayName ? displayName.slice(0, 1).toUpperCase() : "?"}</div>}
        <div><label htmlFor="profile-photo">Profile photo</label><input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choosePhoto(event.currentTarget.files?.[0])} /><p className="small-note">JPG, PNG, or WebP. Maximum 5 MB.</p></div>
      </div>
      <label htmlFor="display-name">Display name</label>
      <input id="display-name" name="display_name" required minLength={2} maxLength={50} defaultValue={profile?.display_name ?? ""} placeholder="How should people know you?" />
      <label htmlFor="major">Major</label>
      <input id="major" name="major" maxLength={100} defaultValue={profile?.major ?? ""} placeholder="e.g. Informatics" />
      <label htmlFor="class-year">Class year</label>
      <select id="class-year" name="class_year" defaultValue={profile?.class_year ?? ""}>
        <option value="">Select your year</option>
        {years.map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
      <label htmlFor="interests">Interests</label>
      <input id="interests" name="interests" defaultValue={profile?.interests.join(", ") ?? ""} placeholder="Coffee, hiking, study sessions" />
      <p className="small-note">Separate interests with commas. Up to 10, with 30 characters each.</p>
      {error && <p className="entry-notice" role="alert">{error}</p>}
      {notice && <p className="entry-notice" role="status">{notice}</p>}
      <button className="primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
      {profile && <Link className="text-link profile-preview-link" href={`/profiles/${profile.id}`}>View public profile →</Link>}
    </form>
  </section>;
}
