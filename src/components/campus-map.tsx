import { getCampusMap } from "@/lib/campus-map";
import type { Hangout } from "@/lib/hangouts";

export function CampusMap({ event }: { event: Hangout }) {
  const { url, location } = getCampusMap(event.campusLocationId);
  return (
    <section className="campus-map" aria-label={`Map for ${event.location}`}>
      <div className="campus-map-heading">
        <div>
          <p className="eyebrow">FIND YOUR WAY</p>
          <h3>{location?.label ?? event.location}</h3>
        </div>
        <span className="campus-map-badge">Official UCI map</span>
      </div>
      <p className="campus-map-note">
        {location?.note ?? `An exact pin hasn't been added for this event. Search for ${event.location} on the campus map.`}
      </p>
      <iframe
        key={url}
        src={url}
        title={`Official UCI map — ${location?.label ?? event.location}`}
        className="campus-map-frame"
        loading="lazy"
        referrerPolicy="no-referrer"
        allowFullScreen
      />
      <div className="campus-map-footer">
        <span>Map not loading? Open the full map.</span>
        <a className="text-link" href={url} target="_blank" rel="noopener noreferrer">
          Open UCI map <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
