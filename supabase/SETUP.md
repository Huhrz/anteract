# Supabase authentication setup

The app uses Supabase Auth through supabase-js and SSR cookies. No ORM or database password is required.

1. Put your project URL and publishable key in `.env.local` using `.env.example`. Restart the dev server after changing these values. Set the same variables in your hosting environment.
2. In Supabase Authentication, enable Email/password and **Confirm email**. Use a minimum password length of 8 or more.
3. Apply `supabase/migrations/202610230001_uci_auth_hook.sql` in the Supabase SQL editor (or via your Supabase migration workflow). In Authentication > Hooks, enable **Before User Created**, choose the Postgres function `public.restrict_uci_signup`. Running the SQL alone does not enable the hook.
4. In Authentication > URL Configuration set Site URL to your deployed app URL (use `http://localhost:3000` during local development). Allow these redirect URLs for each actual origin:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/auth/reset-password`
   - The equivalent two URLs on your production origin.
5. For confirmation links that also work when opened in a different browser, edit the email templates to use these links:

   Confirm signup:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirm your email</a>`

   Reset password:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset your password</a>`

   The callback route also supports the default PKCE email flow, which requires the link to open in the browser that requested it. Set Site URL to the environment you are testing when using the custom templates.
6. Configure custom SMTP before inviting real students. Supabase's default mail service restricts recipients and sending volume; a real UCI address may not receive mail until SMTP is configured.

## Validate before launch

- Attempt a non-UCI signup directly against Supabase Auth: the hook must reject it, even without the website.
- Sign up with a UCI address you control. Before confirmation, login must fail.
- Confirm the email, then log in. the home page (`/`) should load; refreshing should retain the session.
- Open `/events`, `/my-events`, a profile, or a chat in a signed-out browser: it should redirect to `/login`.
- Request a reset, follow its email link, change the password, and log in with the new password.
- Repeat signup for a confirmed account: the empty-identities response or duplicate-account error should switch to login and explain that the account already exists. Unconfirmed accounts can still receive confirmation emails.
- Recovery callbacks use the PKCE recovery marker as well as `next=/auth/reset-password`. Codes redirected to the Site URL (`/` or `/login`) are forwarded to the callback. Keep the redirect allowlist configured; this fallback only works on the same app origin and browser that requested the link.
- Try an expired/used link: it should show an error. Log out and check protected routes again.

## Scope

Authentication is connected. Existing event, membership, safety, and messaging features remain frontend demo data stored on this device; they are not a shared Supabase database. Do not use that demo storage for real student conversations. Before persisting those features, add migrations and Row Level Security policies, including confirmed UCI identity and conversation membership checks.

The signup hook restricts account creation. Protected app routes also check the current verified email so changing to another domain cannot grant app access. Future database policies must independently enforce that rule. UCI email ownership does not establish current enrollment.

Never expose a secret/service-role key in a NEXT_PUBLIC variable. No administrative key is required by this implementation.

The app home is `/`; authentication lives at `/login`. Successful login and signup confirmation lead home. Signed-out visitors to app pages go to `/login`.
