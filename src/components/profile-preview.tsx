import { profileInitials } from "@/lib/profile";
import { parseSocialLinks, type SocialLink } from "@/lib/social-links";
import { SocialPlatformIcon } from "./social-platform-icon";

export function ProfilePreview({ name, major, year, bio, interests, photoUrl, socialLinks }: { name: string; major: string; year: string; bio: string; interests: string[]; photoUrl: string; socialLinks: SocialLink[] }) {
  const validLinks = socialLinks.flatMap(link => {
    const parsed = parseSocialLinks([link]);
    return parsed.ok ? parsed.links : [];
  });
  return <article className="editor-preview-card" aria-label="Public profile preview">
    <div className="editor-preview-cover"><span>UCI · YOUR CAMPUS, YOUR PEOPLE</span><img src="/anteater.svg" alt="" width="80" height="80" /></div>
    <div className="editor-preview-body">
      <div className="editor-preview-avatar">{photoUrl ? <img src={photoUrl} alt="Your profile" /> : <span>{profileInitials(name) || "A"}</span>}</div>
      <span className="editor-campus-label">University of California, Irvine</span>
      <h3>{name.trim() || "Your name"}</h3>
      <p className="editor-preview-meta">{[major.trim(), year].filter(Boolean).join(" · ") || "Your major & class year"}</p>
      <div className="editor-preview-section"><h4>A little about me</h4><p className={bio.trim() ? "" : "preview-placeholder"}>{bio.trim() || "Your favorite campus spot, a weekend ritual, or what you’d love to do together."}</p></div>
      <div className="editor-preview-section"><h4>Things we could have in common</h4><div className="editor-preview-interests">{interests.length ? interests.map(interest => <span key={interest}>{interest}</span>) : <p className="preview-placeholder">Add a few interests to spark a hello.</p>}</div></div>
      {!!validLinks.length && <div className="editor-preview-socials">{validLinks.map((link, index) => <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${link.platform} (opens in a new tab)`}><SocialPlatformIcon platform={link.platform} /><span>{link.platform}</span></a>)}</div>}
    </div>
  </article>;
}
