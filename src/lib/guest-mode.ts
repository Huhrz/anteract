// Explicit local/demo opt-in. A configured backend always keeps real authentication.
export function canUseGuestMode(flag: string | undefined, url: string | undefined, key: string | undefined) {
  return flag === "true" && !url && !key;
}

export const guestModeEnabled = canUseGuestMode(
  process.env.NEXT_PUBLIC_GUEST_MODE,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
