"use client";

import { useState, type FormEvent } from "react";
import { CampusMapPanel } from "./campus-map";
import { getCampusMap, getCampusSearchUrl, parseCampusShareLink, searchDemoPlaces, type CampusMapPlace } from "@/lib/campus-map";
import type { Hangout } from "@/lib/hangouts";

type MapView = { kind: "search"; query: string } | { kind: "place"; place: CampusMapPlace };

export function CampusLocationPicker({ event, onSelect }: { event: Hangout; onSelect: (place: CampusMapPlace) => void }) {
  const currentMap = getCampusMap(event.campusLocationId, event.campusMapPlace);
  const [query, setQuery] = useState(event.location);
  const [submittedQuery, setSubmittedQuery] = useState(event.location);
  const [view, setView] = useState<MapView>(() => currentMap.location
    ? { kind: "place", place: currentMap.location }
    : { kind: "search", query: event.location });
  const [candidate, setCandidate] = useState<CampusMapPlace | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mapRevision, setMapRevision] = useState(0);
  const matches = searchDemoPlaces(submittedQuery);
  const map = view.kind === "search"
    ? { url: getCampusSearchUrl(view.query), label: `Search: ${view.query}`, note: "These are live search results from UCI’s official map. Select a result there to inspect its pin." }
    : { url: getCampusMap(undefined, view.place).url, label: view.place.label, note: "Check the location shown on the official map, then choose Use this location to update your demo event." };
  const applied = candidate && currentMap.location?.markerId === candidate.markerId && event.location === candidate.label;

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const term = query.trim();
    setCandidate(null);
    setNotice("");
    if (!term) { setError("Enter a campus location name to search."); return; }
    setError("");
    setSubmittedQuery(term);
    setView({ kind: "search", query: term });
    setMapRevision((revision) => revision + 1);
    setDisplayName(term);
    setShareUrl("");
  }

  function preview(place: CampusMapPlace) {
    setCandidate({ label: place.label, markerId: place.markerId });
    setView({ kind: "place", place });
    setMapRevision((revision) => revision + 1);
    setError("");
    setNotice("Check the pin on the map, then use this location.");
  }

  function previewShareLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCandidate(null);
    setNotice("");
    const link = parseCampusShareLink(shareUrl);
    const label = displayName.trim();
    if (!link) { setError("Paste a location share link from map.uci.edu, not a search or general map link."); return; }
    if (!label || label.length > 120) { setError("Enter the name to show on the event (up to 120 characters)."); return; }
    preview({ label, markerId: link.markerId });
  }

  return (
    <section className="location-picker" aria-label="Choose event location">
      <div className="location-picker-heading"><span className="step-number">01</span><div><h2>Find a campus location</h2><p>Search the official map, preview a place, then add it to your event.</p></div></div>
      <form className="location-search-form" onSubmit={search}>
        <label htmlFor="campus-search">Location name</label>
        <div><input id="campus-search" name="campus-search" value={query} maxLength={120} placeholder="e.g. Langson Library or ARC" onChange={(e) => { setQuery(e.target.value); setCandidate(null); setNotice(""); }} /><button className="primary" type="submit">Search UCI map <span aria-hidden="true">↗</span></button></div>
      </form>
      <div className="location-quick-heading"><h3>Quick matches</h3><span>Verified demo locations</span></div>
      {matches.length ? <ul className="location-result-list">{matches.map((place) => <li key={place.markerId}><span><strong>{place.label}</strong><small>Official UCI map location</small></span><button className="secondary" type="button" aria-label={`Preview ${place.label}`} onClick={() => preview(place)}>Preview pin</button></li>)}</ul> : <p className="location-no-results" role="status">No matches in our small demo list. Check the live official results below, or import a location share link.</p>}
      <details className="location-import">
        <summary>Choose a different place from the official map</summary>
        <p>In the official results below, open a place, choose that location’s Share icon, then copy its location link. Paste it here and review the pin before using it.</p>
        <form onSubmit={previewShareLink}>
          <label htmlFor="place-name">Name shown on the event</label><input id="place-name" value={displayName} maxLength={120} placeholder="e.g. Engineering Gateway" onChange={(e) => { setDisplayName(e.target.value); setCandidate(null); setNotice(""); }} />
          <label htmlFor="place-share-url">UCI location share link</label><input id="place-share-url" type="url" value={shareUrl} placeholder="https://map.uci.edu/?id=463#!m/…" onChange={(e) => { setShareUrl(e.target.value); setCandidate(null); setNotice(""); }} />
          <button className="secondary" type="submit">Preview shared location</button>
        </form>
      </details>
      {error && <p className="location-error" role="alert">{error}</p>}
      <CampusMapPanel key={mapRevision} url={map.url} label={map.label} note={map.note} />
      <div className="location-apply"><div><span className="step-number">02</span><div><strong>{candidate?.label ?? "Choose a pin to continue"}</strong><p>{candidate ? "Use the button to put this location on your demo event." : "Preview a quick match or paste a location share link."}</p></div></div><button className="primary" type="button" disabled={!candidate || Boolean(applied)} onClick={() => { if (candidate) { onSelect(candidate); setNotice(`${candidate.label} is now shown on your demo event. Changes reset on refresh.`); } }}>{applied ? "Selected ✓" : "Use this location"}</button></div>
      <p className="location-picker-status" role="status">{notice}</p>
    </section>
  );
}
