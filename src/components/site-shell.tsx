"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { useEvents } from "./event-provider";
import { useDemo } from "./demo-provider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [logoutError, setLogoutError] = useState("");
  const { events, loading } = useEvents();
  const { storageError } = useDemo();
  const links = [{ href: "/", label: "Home" }, { href: "/events", label: "Browse Events" }, { href: "/my-events", label: "My Events" }, { href: "/friends", label: "Friends" }, { href: "/profile", label: "My Profile" }];
  if (pathname === "/login" || pathname.startsWith("/auth/")) return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" className="welcome-main">{children}</main>
  </>;
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="header">
      <Link className="brand" href="/" aria-label="Anteract home"><span className="brand-mark" aria-hidden="true"><img src="/anteater.svg" alt="" width="31" height="31" /></span>anteract</Link>
      <nav className="nav" aria-label="Main navigation">{links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const myEventCount = events.filter((event) => event.isJoined || event.isHost).length;
        return <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}>{link.label}{link.href === "/my-events" && !loading && myEventCount > 0 && <span className="nav-count">{myEventCount}</span>}</Link>;
      })}</nav>
      {pathname === "/map-demo" || pathname === "/create-demo" ? <Link className="text-link" href="/login">Log in</Link> : <button className="quiet-button" onClick={async () => {
        try {
          const { error } = await createClient().auth.signOut();
          if (error) throw error;
          window.location.assign("/login");
        } catch { setLogoutError("Could not log out. Please try again."); }
      }}>Log out</button>}
    </header>
    {logoutError && <p className="storage-warning" role="alert">{logoutError}</p>}
    {storageError && <p className="storage-warning" role="status">This browser can’t save your demo. Changes will last until you refresh.</p>}
    <main id="main-content">{children}</main>
    <footer><span>anteract · A little more connected.</span><span>Sample events and messaging are demo features.</span></footer>
  </>;
}
