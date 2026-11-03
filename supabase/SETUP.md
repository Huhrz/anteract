# Supabase authentication setup

The app uses Supabase Auth through supabase-js and SSR cookies. No ORM or database password is required.

1. Put your project URL and publishable key in `.env.local` using `.env.example`. Restart the dev server after changing these values. Set the same variables in your hosting environment.
2. In Supabase Authentication, enable Email/password and **Confirm email**. Use a minimum password length of 8 or more.
3. Apply `supabase/migrations/202610230001_uci_auth_hook.sql` in the Supabase SQL editor (or via your Supabase migration workflow). In Authentication > Hooks, enable **Before User Created**, choose the Postgres function `public.restrict_uci_signup`. Running the SQL alone does not enable the hook.
4. Apply `supabase/migrations/202610240001_profiles.sql` to create the profile table and private profile-photo bucket. The `/profile` page lets a signed-in student edit their display name, major, class year, interests, and photo. `/profiles/<user-id>` displays the profile to signed-in UCI students. Photos must be JPG, PNG, or WebP and no larger than 5 MB.
5. Apply `supabase/migrations/202610240002_events.sql` after the profiles migration in the same Supabase project. It creates shared events and memberships with RLS, unique joins, and database-enforced capacity. The app supports creating, browsing, joining, leaving, and cancelling events. Run each migration once; do not rerun a file that has already partially or fully succeeded.
6. Apply `supabase/migrations/202610310001_friend_requests.sql` after the profiles and events migrations. It creates the friend-request table and access policies. Users can find incoming invitations at the top of the **Friends** page (`/friends`). If the app reports that `public.friend_requests` is missing from the schema cache after applying the migration, confirm it was run in the same Supabase project configured by `.env.local`; then reload the schema cache from Supabase Dashboard > Settings > API, or wait briefly and retry.
7. In Authentication > URL Configuration set Site URL to your deployed app URL (use `http://localhost:3000` during local development). Allow these redirect URLs for each actual origin:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/auth/reset-password`
   - The equivalent two URLs on your production origin.
8. For confirmation links that also work when opened in a different browser, edit the email templates to use these links:

   Confirm signup:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirm your email</a>`

   Reset password:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset your password</a>`

   The callback route also supports the default PKCE email flow, which requires the link to open in the browser that requested it. Set Site URL to the environment you are testing when using the custom templates.
9. Configure custom SMTP before inviting real students. Supabase's default mail service restricts recipients and sending volume; a real UCI address may not receive mail until SMTP is configured.

## Validate before launch

- Attempt a non-UCI signup directly against Supabase Auth: the hook must reject it, even without the website.
- Sign up with a UCI address you control. Before confirmation, login must fail.
- Confirm the email, then log in. the home page (`/`) should load; refreshing should retain the session.
- Apply the profiles migration, open `/profile`, save profile details and a photo, then use the profile link to view it. A different signed-in UCI account can view the profile but cannot edit it.
- Apply the events migration, create an event, then use another signed-in UCI account to join and leave. Confirm the event and membership are visible across accounts and a full event rejects additional joins.
- Open `/events`, `/my-events`, a profile, or a chat in a signed-out browser: it should redirect to `/login`.
- Request a reset, follow its email link, change the password, and log in with the new password.
- Repeat signup for a confirmed account: the empty-identities response or duplicate-account error should switch to login and explain that the account already exists. Unconfirmed accounts can still receive confirmation emails.
- Recovery callbacks use the PKCE recovery marker as well as `next=/auth/reset-password`. Codes redirected to the Site URL (`/` or `/login`) are forwarded to the callback. Keep the redirect allowlist configured; this fallback only works on the same app origin and browser that requested the link.
- Try an expired/used link: it should show an error. Log out and check protected routes again.

## Scope

Authentication, profiles, events, and event memberships use Supabase when their migrations have been applied to the configured project. Chat, account reports/blocks, and attendance confirmation remain local demo features. Do not use local demo messaging for real student conversations. Before persisting chat or safety features, add migrations and Row Level Security policies, including conversation membership checks.

The signup hook restricts account creation. Protected app routes also check the current verified email so changing to another domain cannot grant app access. Future database policies must independently enforce that rule. UCI email ownership does not establish current enrollment.

Never expose a secret/service-role key in a NEXT_PUBLIC variable. No administrative key is required by this implementation.

The app home is `/`; authentication lives at `/login`. Successful login and signup confirmation lead home. Signed-out visitors to app pages go to `/login`.

## Interest tags and discovery (review draft)

Apply `migrations/202611010001_event_tags.sql` after the existing events migration. It adds `events.tags` as a non-null text array, defaulting to an empty list for existing events. The constraint accepts at most five distinct lowercase tags, each up to 24 characters and containing letters a-z, digits, and single hyphens. Event creation normalizes input using the same rules. Apply this migration before deploying the new event form, which writes the tags column.

Tags describe interests and do not enforce friends-only or club-only access. Existing event and membership policies continue to apply. The new UI filters upcoming events by category, text (including tags), all selected tags, local calendar dates, and open capacity. Production writes and database constraints require verification against a configured Supabase test project; this local review does not apply migrations remotely.

## Profile social links

Before deploying the updated profile editor to a real backend, review and apply `migrations/202611010002_profile_social_links.sql` after the profiles migration. It adds a `social_links` JSONB array with an empty default, a five-link maximum, platform labels and HTTPS URL checks. Existing profile read/write policies continue to control access. The client normalizes and validates the same platform/link pairs before saving. Guest-mode changes stay in local browser storage and do not require this migration.

## Account settings and deletion

Set `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) in the server environment to enable `DELETE /api/account`. Never prefix this secret with `NEXT_PUBLIC_`. The route checks the same-origin request, explicit confirmation, and verified UCI session, and derives the target account from Supabase `getUser()`. It removes all files in the user's profile-photo folder, revokes refresh sessions, then hard-deletes the auth user. Existing foreign-key cascades remove their profile, friend requests, hosted events, and event memberships. Storage removal and auth deletion are separate operations; a later failure can leave the account without its photo and requires signing in again to retry. Existing access JWTs expire normally; deleting the user does not cryptographically invalidate them. The endpoint verifies the user with Auth on every request.

The header settings include logout and Light/Dark/System appearance saved in this browser. Guest mode exposes appearance without pretending to have a deletable account. Profile editing is available through My Profile in the main navigation. Validate permanent deletion using a disposable verified account with a photo and hosted event before deployment; never use a real student's account for testing.

## Profile editor and optional bio

Apply `supabase/migrations/20261103025457_profile_bio.sql` before deploying the redesigned profile editor. It adds an optional `bio` field (empty by default, at most 500 characters) without changing existing profile data, grants, or RLS policies. The migration uses a short lock timeout; if the table is busy and it rolls back, retry during a quieter period.

Verify with `select bio from public.profiles limit 1;`. In `/profile`, edit the bio, save, reload, and check `/profiles/<user-id>`. Existing profile, photo, and social-link migrations are still required. Guest mode supports the same editor and stores the bio locally.
