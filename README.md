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

## Campus map demo

Open `/map-demo` to choose a location for one of three fictional sample events. No Supabase configuration or login is needed. There is no full event-creation form yet; this page demonstrates its location field. Existing event pages keep their authentication requirements.

1. Enter a campus location name and press **Search UCI map**. The embedded official map displays real search results.
2. For a quick match, press **Preview pin**, check the map, then **Use this location**. Quick matches are a small verified demo catalog (Science Library, Langson Library, ARC, Student Center, Aldrich Park, and Watson Bridge), not the live UCI index.
3. For any other result, open the place in the official map, choose that location's Share icon, and copy its location link. Expand **Choose a different place from the official map**, enter the display name and link, preview the pin, then use it. A global map/search share link is not a location link.
4. The event preview's name and map link update together. Changing to a different marker clears the old meeting instructions. Each sample event keeps its own draft while switching events; refreshing resets these drafts. Nothing is published or saved to the backend.

Event cards, event details, and My Events now link their location text to the official UCI map. Details also embed the map below the meeting instructions. The full-map link stays available if embedding is blocked or slow. No map API key or SDK is needed.

- Science Library opens the library building marker.
- Aldrich Park opens the park landmark; the gathering point remains the entrance near Langson Library.
- UTC opens Watson Bridge, a nearby campus landmark; the gathering point remains the UTC end of the bridge, not an arbitrary restaurant.

`src/components/campus-location-picker.tsx` is the reusable selection field. It returns a `{ label, markerId }` place to the demo page. A selected event can store it as optional `campusMapPlace`; existing preset events use `campusLocationId`. Both render through the same map and event-location components. Link validation restricts imports to a single marker on UCI's official map and normalizes the URL. It cannot verify that the supplied name matches a real marker: the person must review the official preview before choosing.

Search and marker URLs are documented by Concept3D: https://help.concept3d.com/hc/en-us/articles/115004127673-Interactive-Map-Query-Strings . Directly fetching search results needs separate API access; this demo does not extract the map's internal key, proxy private APIs, or read cross-origin iframe state. The real search runs within the official iframe; selections outside the quick catalog use the share-link handoff. These are landmark links, not live locations or route calculations.

Official map: https://map.uci.edu/?id=463 . UCI's bridge reference: https://parking.uci.edu/traffic/access-clearance/ .

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
