import type { Metadata } from "next";
import "./globals.css";
import { GuestProvider } from "@/components/guest-provider";
import { DemoProvider } from "@/components/demo-provider";
import { EventProvider } from "@/components/event-provider";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Anteract | Find your people",
  description: "Discover a hangout and connect with other UCI students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('anteract-appearance');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()` }} /></head><body><GuestProvider><DemoProvider><EventProvider><SiteShell>{children}</SiteShell></EventProvider></DemoProvider></GuestProvider></body></html>;
}
