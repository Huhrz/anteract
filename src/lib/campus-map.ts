export const campusLocations = {
  "science-library": {
    label: "Science Library (SLIB)",
    markerId: "83168",
    note: "The pin marks the library building. Meet outside the main entrance.",
  },
  "utc-bridge": {
    label: "Watson Bridge · near UTC",
    markerId: "126143",
    note: "The pin marks Watson Bridge, not a restaurant. Meet at the University Town Center end of the bridge.",
  },
  "aldrich-park": {
    label: "Aldrich Park",
    markerId: "126146",
    note: "The pin marks the park as a whole. Meet at the entrance near Langson Library.",
  },
} as const;

export type CampusLocationId = keyof typeof campusLocations;

export type CampusMapPlace = { label: string; markerId: string };

// A small, verified demo catalog, not a copy of the live UCI search index.
// Live searches stay inside the official map; its result API requires access.
export const campusSearchPlaces = [
  { label: "Science Library (SLIB)", markerId: "83168", aliases: ["science library", "slib"] },
  { label: "Langson Library (LLIB)", markerId: "83170", aliases: ["langson", "llib"] },
  { label: "Anteater Recreation Center (ARC)", markerId: "1117541", aliases: ["arc", "recreation center"] },
  { label: "Student Center", markerId: "1117786", aliases: ["student center", "sc"] },
  { label: "Aldrich Park", markerId: "126146", aliases: ["aldrich", "park"] },
  { label: "Watson Bridge · near UTC", markerId: "126143", aliases: ["watson", "bridge", "utc", "university town center"] },
] as const;

const officialMapUrl = "https://map.uci.edu/?id=463";
const markerPattern = /^[1-9]\d{0,9}$/;

export function searchDemoPlaces(query: string): CampusMapPlace[] {
  const term = query.trim().toLowerCase();
  return campusSearchPlaces.filter((place) => !term || place.label.toLowerCase().includes(term) || place.aliases.some((alias) => alias.includes(term)));
}

export function getCampusSearchUrl(query: string) {
  const term = query.trim();
  return term ? `${officialMapUrl}#!s/${encodeURIComponent(term)}` : officialMapUrl;
}

// Validate only the share-link format. The person must review the actual marker
// in the official map; a well-formed ID does not prove a place exists.
export function parseCampusShareLink(value: string): { markerId: string; url: string } | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname !== "map.uci.edu" || url.port || url.username || url.password || url.pathname !== "/") return null;
    if (url.searchParams.getAll("id").length !== 1 || url.searchParams.get("id") !== "463") return null;
    const markers = url.hash.split(/[?!&]/).filter((part) => part.startsWith("m/"));
    if (markers.length !== 1) return null;
    const markerId = markers[0].slice(2);
    if (!markerPattern.test(markerId)) return null;
    return { markerId, url: `${officialMapUrl}#!m/${markerId}` };
  } catch { return null; }
}

// Official UCI / Concept3D share links. IDs verified against map.uci.edu.
// Watson Bridge connects the campus and UTC across Campus Drive:
// https://parking.uci.edu/traffic/access-clearance/
export function getCampusMap(locationId?: string, chosenPlace?: CampusMapPlace) {
  const preset = locationId && Object.hasOwn(campusLocations, locationId)
    ? campusLocations[locationId as CampusLocationId]
    : undefined;
  const validChoice = chosenPlace && markerPattern.test(chosenPlace.markerId) && chosenPlace.label.trim() && chosenPlace.label.trim().length <= 120;
  const location = validChoice ? {
    label: chosenPlace.label.trim(),
    markerId: chosenPlace.markerId,
    note: "This pin marks the selected campus location. Follow the host’s meeting instructions for the exact gathering spot.",
  } : preset;
  return {
    url: location
      ? `${officialMapUrl}#!m/${location.markerId}`
      : officialMapUrl,
    location,
  };
}
