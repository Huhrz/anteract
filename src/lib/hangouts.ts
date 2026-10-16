export const categories = ["All", "Study", "Food", "Active"] as const;
export type Category = (typeof categories)[number];

export type Hangout = {
  id: string;
  title: string;
  category: Exclude<Category, "All">;
  location: string;
  time: string;
  description: string;
  participants: number;
  capacity: number;
  hostId: string;
  attendeeIds: string[];
  meetingPoint: string;
  bring: string;
};

export type Person = {
  id: string;
  name: string;
  initials: string;
  major: string;
  year: string;
  bio: string;
  interests: string[];
  color: "blue" | "green" | "gold";
};

// Fictional profiles for the frontend demo.
export const people: Person[] = [
  { id: "maya", name: "Maya Chen", initials: "MC", major: "Computer Science", year: "Third year", bio: "Usually looking for a sunny study spot, a matcha, or a reason to take a break. Always happy to meet another Anteater.", interests: ["Study sessions", "Matcha", "Photography"], color: "blue" },
  { id: "jordan", name: "Jordan Lee", initials: "JL", major: "Business Economics", year: "Second year", bio: "Trying a new food spot every week. Come along for a casual dinner and tell me your favorite place around campus.", interests: ["Food", "Music", "Board games"], color: "gold" },
  { id: "alex", name: "Alex Rivera", initials: "AR", major: "Environmental Science", year: "Fourth year", bio: "A little fresh air makes every day better. Into easy campus walks, weekend hikes, and meeting new people.", interests: ["Walking", "Hiking", "Coffee"], color: "green" },
  { id: "sam", name: "Sam Patel", initials: "SP", major: "Informatics", year: "Second year", bio: "Here for good company, creative projects, and the occasional very competitive board game.", interests: ["Design", "Study sessions", "Board games"], color: "blue" },
];

// Replace this array with backend data when the team is ready.
export const hangouts: Hangout[] = [
  { id: "study-1", title: "A little study company", category: "Study", location: "Science Library", time: "Today · 4:00 PM", description: "Bring your notes. We'll keep each other focused and take a coffee break.", participants: 2, capacity: 5, hostId: "maya", attendeeIds: ["maya", "sam"], meetingPoint: "Meet outside the main entrance before finding a table together.", bring: "Your laptop, notes, and anything you want to work on." },
  { id: "food-1", title: "Grab a bite at UTC", category: "Food", location: "University Town Center", time: "Today · 6:00 PM", description: "A casual dinner, a new face, and a good excuse to get off campus.", participants: 3, capacity: 6, hostId: "jordan", attendeeIds: ["jordan", "maya", "sam"], meetingPoint: "Meet at the UTC end of the pedestrian bridge. We'll choose a food spot together.", bring: "Your appetite! Everyone pays for their own meal." },
  { id: "active-1", title: "Take a park break", category: "Active", location: "Aldrich Park", time: "Tomorrow · 10:00 AM", description: "An easy walk around campus. Come for some fresh air and conversation.", participants: 1, capacity: 4, hostId: "alex", attendeeIds: ["alex"], meetingPoint: "Meet at the park entrance near Langson Library for a relaxed 30-minute walk.", bring: "Comfortable shoes and a bottle of water." },
];

export const symbols = { Study: "✎", Food: "☕", Active: "↗" };
