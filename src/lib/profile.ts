export type Profile = {
  id: string;
  display_name: string;
  major: string;
  class_year: string;
  interests: string[];
  avatar_path: string | null;
};

export const profilePhotoBucket = "profile-photos";
export const profilePhotoMaxBytes = 5 * 1024 * 1024;

export function profileInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function parseInterests(value: string) {
  return [...new Set(value.split(",").map((interest) => interest.trim()).filter(Boolean))];
}
