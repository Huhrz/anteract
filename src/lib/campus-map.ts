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

// Official UCI / Concept3D share links. IDs verified against map.uci.edu.
// Watson Bridge connects the campus and UTC across Campus Drive:
// https://parking.uci.edu/traffic/access-clearance/
export function getCampusMap(locationId?: string) {
  const location = locationId && Object.hasOwn(campusLocations, locationId)
    ? campusLocations[locationId as CampusLocationId]
    : undefined;
  return {
    url: location
      ? `https://map.uci.edu/?id=463#!m/${location.markerId}`
      : "https://map.uci.edu/?id=463",
    location,
  };
}
