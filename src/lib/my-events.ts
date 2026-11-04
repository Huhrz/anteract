type PersonalEvent = { id: string; startsAt: string; isHost: boolean; isJoined: boolean };

/** Events are canceled by deletion. Use the provider's current membership snapshot. */
export function groupMyEvents<T extends PersonalEvent>(events: readonly T[], now: number) {
  const unique = [...new Map(events.filter(event => event.isHost || event.isJoined).map(event => [event.id, event])).values()];
  const dated = unique.filter(event => Number.isFinite(Date.parse(event.startsAt)));
  const ascending = (a: T, b: T) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id.localeCompare(b.id);
  const upcoming = dated.filter(event => Date.parse(event.startsAt) > now).sort(ascending);
  const past = dated.filter(event => Date.parse(event.startsAt) <= now).sort((a, b) => ascending(b, a));
  // Active hosting plans first, then the most recent hosting history.
  const hosting = [...upcoming, ...past].filter(event => event.isHost);
  return { upcoming, hosting, past };
}
