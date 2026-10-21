"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo } from "./demo-provider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, ready, storageError } = useDemo();
  const links = [{ href: "/", label: "Home" }, { href: "/events", label: "Browse Events" }, { href: "/my-events", label: "My Events" }];
  if (pathname === "/") return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" className="welcome-main">{children}</main>
  </>;
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="header">
      <Link className="brand" href="/" aria-label="Anteract home"><span className="brand-mark" aria-hidden="true"><img src="/anteater.svg" alt="" width="31" height="31" /></span>anteract</Link>
      <nav className="nav" aria-label="Main navigation">{links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}>{link.label}{link.href === "/my-events" && ready && Object.keys(state.memberships).length > 0 && <span className="nav-count">{Object.keys(state.memberships).length}</span>}</Link>;
      })}</nav>
      <span className="campus"><span className="campus-dot" /> UCI student demo</span>
    </header>
    {storageError && <p className="storage-warning" role="status">This browser can’t save your demo. Changes will last until you refresh.</p>}
    <main id="main-content">{children}</main>
    <footer><span>anteract · A little more connected.</span><span>Frontend demo · Sample events & profiles · Messages stay on this device.</span></footer>
  </>;
}
