# Anteract

A Next.js + React frontend prototype for finding UCI hangouts.

## Run locally

Install Node.js LTS (24.x recommended, including npm), then run inside the project folder:

```sh
npx --yes pnpm@11.25.0 install --frozen-lockfile
npx --yes pnpm@11.25.0 dev
```

Open http://localhost:3000. Keep the terminal open; Ctrl+C stops the server.
On Windows PowerShell, use `npx.cmd` instead of `npx` if script execution is blocked.

To check the project:

```sh
npx --yes pnpm@11.25.0 typecheck
npx --yes pnpm@11.25.0 build
```

## Screens and flow

| Screen | Route | What to try |
| --- | --- | --- |
| Home | `/` | Navigate to Browse Events or My Events. |
| Browse Events | `/events` | Filter/search sample events; open Details or press Join. |
| Event details | `/events/study-1` | See meeting information, join/leave, and select a participant's profile. |
| My Events / agenda | `/my-events` | Joined events appear automatically. Press Confirm, then Arrived. Leave removes an event from the agenda. |
| Person's profile | `/profiles/maya` | View their interests and press Chat. All profiles are fictional demo data. |
| Chat | `/chat/maya` | Type and send a local demo message. Switch contacts to view separate conversations. |

Membership follows `joined -> confirmed -> arrived`. Arrived is disabled until attendance is confirmed. Repeated joining does not duplicate an agenda entry or increase the count twice. Attendance, participant counts, and the navigation badge share one state across pages.

Agenda and demo messages survive refresh in this browser's localStorage. Updates are not synchronized live between tabs or shared with teammates or other devices. If browser storage is blocked, an on-page notice explains that changes only last until refresh. Activity times such as "Today" are sample labels, not scheduled live events.

## Where to edit

- `src/app/page.tsx`: Home.
- `src/app/events/`: Browse Events and event detail routes.
- `src/app/my-events/page.tsx`: agenda and attendance controls.
- `src/app/profiles/` and `src/app/chat/`: profile and chat routes.
- `src/components/event-card.tsx`: shared event cards and Join button.
- `src/components/demo-provider.tsx`: shared state and browser persistence.
- `src/lib/demo-state.ts`: join, leave, confirm, arrive, and message transitions.
- `src/lib/hangouts.ts`: event/profile types and sample data.
- `src/app/globals.css`: shared blue/gold styling and responsive layouts.

## Backend handoff

This is a frontend demo with no authentication, database, real reservations, or real message delivery. Pages label the demo clearly. Messages only appear in the sender's own browser; there are no automated fake replies.

Replace sample data in `hangouts.ts` with backend event/profile data and connect the actions in `demo-state.ts` to server calls. Update shared state after a successful response, with loading/error feedback. The server must own authentication, capacity, unique membership, allowed attendance transitions, and conversation access. Keep the current routes and shared components as the UI integration points.
