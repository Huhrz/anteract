import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider } from "@/components/demo-provider";
import { EventProvider } from "@/components/event-provider";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Anteract | Find your people",
  description: "Discover a hangout and connect with other UCI students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><DemoProvider><EventProvider><SiteShell>{children}</SiteShell></EventProvider></DemoProvider></body></html>;
}
