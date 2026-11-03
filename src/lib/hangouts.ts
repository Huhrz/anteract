import type { CampusLocationId, CampusMapPlace } from "./campus-map";

export const categories = ["All", "Study", "Food", "Active"] as const;
export type Category = (typeof categories)[number];

export type Hangout = {
  id: string;
  title: string;
  category: Exclude<Category, "All">;
  location: string;
  campusLocationId?: CampusLocationId;
  campusMapPlace?: CampusMapPlace;
  time: string;
  startsAt?: string;
  tags?: string[];
  description: string;
  participants: number;
  capacity: number;
  hostId: string;
  attendeeIds: string[];
  meetingPoint: string;
  bring: string;
};

export const symbols = { Study: "✎", Food: "☕", Active: "↗" };
