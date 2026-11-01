"use client";

import { parseEventTags, suggestedTags, tagLimits } from "@/lib/event-tags";

export function EventTagInput({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const parsed = parseEventTags(value);
  const selected = parsed.ok ? parsed.tags : [];
  return <div className="tag-editor">
    <label htmlFor="event-tags">Interest tags <span>(optional)</span></label>
    <input id="event-tags" name="tags" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} aria-invalid={!parsed.ok} aria-describedby="event-tags-help event-tags-status" placeholder="coffee, finals, beginner-friendly" />
    <p id="event-tags-help" className="small-note">Separate tags with commas. Up to {tagLimits.count} tags, {tagLimits.length} characters each. Tags describe interests; they don’t restrict who can join.</p>
    <div className="tag-suggestions" aria-label="Suggested interest tags">{suggestedTags.map((tag) => <button type="button" key={tag} className={selected.includes(tag) ? "tag-chip selected" : "tag-chip"} aria-pressed={selected.includes(tag)} disabled={disabled || (!selected.includes(tag) && selected.length >= tagLimits.count)} onClick={() => onChange((selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag]).join(", "))}>#{tag}</button>)}</div>
    <p id="event-tags-status" className={parsed.ok ? "small-note" : "field-error"} aria-live="polite">{parsed.ok ? `${selected.length} of ${tagLimits.count} tags` : parsed.error}</p>
  </div>;
}
