"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AccountSettings } from "./account-settings";
import { guestModeEnabled } from "@/lib/guest-mode";
import { emptyState } from "@/lib/demo-state";
import { useGuest } from "./guest-provider";
import { usePathname } from "next/navigation";
import { useEvents } from "./event-provider";
import { useDemo } from "./demo-provider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const guest = useGuest();
  const { events, loading } = useEvents();
  const { storageError, dispatch } = useDemo();
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    let previousY = Math.max(0, window.scrollY);
    let travel = 0;
    let direction = 0;
    let frame = 0;
    let hidden = false;
    let scrolled = previousY > 16;
    element.classList.toggle("is-scrolled", scrolled);
    element.removeAttribute("data-hidden");
    const reveal = () => {
      hidden = false;
      travel = 0;
      element.removeAttribute("data-hidden");
    };
    const update = () => {
      frame = 0;
      // Clamp elastic overscroll so bouncing at either edge cannot reverse direction.
      const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
      const delta = y - previousY;
      previousY = y;
      if ((y > 16) !== scrolled) {
        scrolled = y > 16;
        element.classList.toggle("is-scrolled", scrolled);
      }
      if (y <= 100 || element.contains(document.activeElement) || element.querySelector('[aria-expanded="true"]')) {
        reveal();
        return;
      }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      if (travel < 8) return;
      const nextHidden = direction > 0;
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        element.toggleAttribute("data-hidden", hidden);
      }
      travel = 0;
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    element.addEventListener("focusin", reveal);
    return () => {
      window.removeEventListener("scroll", onScroll);
      element.removeEventListener("focusin", reveal);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);
  const links = [{ href: "/", label: "Home" }, { href: "/events", label: "Browse" }, { href: "/my-events", label: "Events" }, { href: "/chat", label: "Messages" }, { href: "/friends", label: "Friends" }, { href: "/profile", label: "Profile" }];
  if (pathname === "/login" || pathname.startsWith("/auth/")) return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" className="welcome-main">{children}</main>
  </>;
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="navigation-space" aria-hidden="true" />
    <header ref={header} className="header floating-header">
      <Link className="brand" href="/" aria-label="Anteract home"><span className="brand-mark" aria-hidden="true"><img src="/anteater.svg" alt="" width="31" height="31" /></span>anteract</Link>
      <nav className="nav" aria-label="Main navigation">{links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const myEventCount = events.filter((event) => event.isJoined || event.isHost).length;
        return <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}>{link.label}{link.href === "/my-events" && !loading && myEventCount > 0 && <span className="nav-count" aria-label={`${myEventCount} joined or hosted events`}>{myEventCount}</span>}</Link>;
      })}</nav>
      <AccountSettings publicPage={pathname === "/map-demo"} />
    </header>
    {guestModeEnabled && <div className="guest-banner"><span><strong>Guest demo</strong> · Try events, friends and profiles. Changes stay in this browser.</span><button type="button" onClick={() => { if (window.confirm("Reset your guest events, profile, friends and local messages?")) { guest.reset(); dispatch({ type: "hydrate", state: emptyState }); } }}>Reset sample data</button></div>}
    {guestModeEnabled && guest.storageError && <p className="storage-warning" role="status">This browser could not save guest data. Your changes will last until you refresh.</p>}
    {storageError && <p className="storage-warning" role="status">This browser can’t save your demo. Changes will last until you refresh.</p>}
    <main id="main-content">{children}</main>
    <footer><span>anteract · A little more connected.</span><span>Sample events and messaging are demo features.</span></footer>
  </>;
}
