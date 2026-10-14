import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anteract | Find your people",
  description: "Discover a hangout and connect with other UCI students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
