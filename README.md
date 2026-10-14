# Anteract

A small Next.js + React frontend for the INF 151 UCI hangout project.
One page, three sample activity cards, category filters, and Join/Leave buttons.

## Run locally

Requires Node.js 20.9+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. To check the project:

```sh
pnpm typecheck
pnpm build
```

## Where to edit

- `src/app/page.tsx`: the page, category filters, and Join/Leave handler.
- `src/app/globals.css`: blue/gold styling and mobile layout.
- `src/lib/hangouts.ts`: the `Hangout` type and sample data.

## Backend handoff

This is a frontend demo. No authentication, database, API routes, or real reservations yet. Join state stays in React memory and resets on refresh. Activity times are sample labels.

When the backend is ready, replace the sample `hangouts` array with fetched data and connect `toggleJoin()` to the join/leave request. Update local state only after success, and add loading/error feedback. The backend should own authentication, membership, capacity checks, and participant counts. The team can choose Supabase or Firebase later.

Scope is based on the activity-based connection idea in Week 2 and the discovery/join flow in Week 3. Chat, check-in, feedback, and points can come later.
