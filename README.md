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

