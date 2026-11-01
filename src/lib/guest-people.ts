import { people } from "./hangouts";

export const guestPeople = people.map((person) => ({
  id: person.id, display_name: person.name, major: person.major, class_year: person.year,
  interests: person.interests, avatar_path: null, photoUrl: "",
}));
