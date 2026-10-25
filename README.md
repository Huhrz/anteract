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

## Campus map demo

Open `/map-demo` to try the official UCI map with three public, fictional sample events; this demo needs no Supabase configuration or login. Existing event pages keep their authentication requirements.

Event cards, event details, and My Events now link their location text to the official UCI map. Details also embed the map below the meeting instructions. The full-map link stays available if embedding is blocked or slow. No map API key or SDK is needed.

- Science Library opens the library building marker.
- Aldrich Park opens the park landmark; the gathering point remains the entrance near Langson Library.
- UTC opens Watson Bridge, a nearby campus landmark; the gathering point remains the UTC end of the bridge, not an arbitrary restaurant.

Mappings are in `src/lib/campus-map.ts`, referenced by each event's optional `campusLocationId` in `src/lib/hangouts.ts`. For a future location without a verified pin, the component opens the general UCI map and asks the student to search. These are landmark links, not custom gathering pins, live locations, or route calculations.

Official map: https://map.uci.edu/?id=463 . UCI's bridge reference: https://parking.uci.edu/traffic/access-clearance/ .

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

## Account safety

Profiles and chats offer Report account and Block account controls. Reports require a reason, allow up to 2,000 characters of optional details, and offer blocking in the same step. A confirmation explains blocking before it is applied. Unblock from the same profile or chat. Blocking disables composing and sending messages, including in the shared state reducer, and marks the conversation as blocked. Existing messages and shared event attendance remain available.

Blocks and reports persist in this browser alongside the agenda. These are demo controls: reports are not delivered to moderators and blocks do not affect another device or person. If storage fails, changes last only for this session.

For production, authenticate the acting account on the server, store reports in a private moderation queue with access controls, and enforce blocks on both message delivery and conversation access in both directions. Never rely on browser state for enforcement or disclose the reporter to the reported account.
