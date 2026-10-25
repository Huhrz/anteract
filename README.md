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
| Browse Events | `/events` | Filter/search shared events; create an event or press Join. |
| Create event | `/events/new` | Create a UCI event with a date, capacity, and meeting details. |
| Event details | `/events/<id>` | See event information, join/leave, and cancel an event you host. |
| My Events | `/my-events` | View events you joined and events you host. |
| Person's profile | `/profiles/maya` | View their interests and press Chat. All profiles are fictional demo data. |
| Chat | `/chat/maya` | Type and send a local demo message. Switch contacts to view separate conversations. |

Events and memberships are stored in Supabase and shared across signed-in UCI accounts. Database policies restrict event creation and membership to the authenticated UCI user; unique membership and event capacity are enforced in the database. Cancelling an event removes its memberships. Chat and report/block controls remain local demo behavior. Existing sample-profile content and time labels are not database records.

## Where to edit

- `src/app/page.tsx`: Home.
- `src/app/events/`: Browse Events and event detail routes.
- `src/app/my-events/page.tsx`: agenda and attendance controls.
- `src/app/profiles/` and `src/app/chat/`: profile and chat routes.
- `src/components/event-card.tsx`: shared event cards and Join button.
- `src/components/event-provider.tsx`: shared event queries and actions.
- `src/components/demo-provider.tsx`: local demo state for chat and safety controls.
- `src/lib/demo-state.ts`: local demo message and safety transitions.
- `src/lib/hangouts.ts`: event categories and fictional profiles.
- `src/app/globals.css`: shared blue/gold styling and responsive layouts.

## Backend handoff

Authentication, profiles, event creation, browsing, memberships, and capacity enforcement use Supabase after their migrations are applied. Messages only appear in the sender's own browser; there are no automated fake replies.

Keep event writes in Supabase and preserve database-side authorization and capacity checks. Messaging, moderation reports/blocks, and attendance confirmation remain demo-only; do not treat browser state as enforcement or delivery for real conversations.

## Account safety

Profiles and chats offer Report account and Block account controls. Reports require a reason, allow up to 2,000 characters of optional details, and offer blocking in the same step. A confirmation explains blocking before it is applied. Unblock from the same profile or chat. Blocking disables composing and sending messages, including in the shared state reducer, and marks the conversation as blocked. Existing messages and shared event attendance remain available.

Blocks and reports persist in this browser alongside the agenda. These are demo controls: reports are not delivered to moderators and blocks do not affect another device or person. If storage fails, changes last only for this session.

For production, authenticate the acting account on the server, store reports in a private moderation queue with access controls, and enforce blocks on both message delivery and conversation access in both directions. Never rely on browser state for enforcement or disclose the reporter to the reported account.
