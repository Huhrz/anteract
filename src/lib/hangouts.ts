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
};

// Replace this array with backend data when the team is ready.
export const hangouts: Hangout[] = [
  { id: "study-1", title: "A little study company", category: "Study", location: "Science Library", time: "Today · 4:00 PM", description: "Bring your notes. We'll keep each other focused and take a coffee break.", participants: 2, capacity: 5 },
  { id: "food-1", title: "Grab a bite at UTC", category: "Food", location: "University Town Center", time: "Today · 6:00 PM", description: "A casual dinner, a new face, and a good excuse to get off campus.", participants: 3, capacity: 6 },
  { id: "active-1", title: "Take a park break", category: "Active", location: "Aldrich Park", time: "Tomorrow · 10:00 AM", description: "An easy walk around campus. Come for some fresh air and conversation.", participants: 1, capacity: 4 },
];
