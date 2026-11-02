# Anteract

A Next.js + React app for discovering UCI hangouts, making plans, and connecting with other students.

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
| Friends | `/friends` | Search students, send requests, and accept or decline invitations. |
| My Profile | `/profile` | Edit your profile, photo, interests, and social media links. |
| Person's profile | `/profiles/maya` | View their interests and press Chat. All profiles are fictional demo data. |
| Chat | `/chat/maya` | Type and send a local demo message. Switch contacts to view separate conversations. |

In backend mode, events and memberships are stored in Supabase and shared across signed-in UCI accounts. Database policies restrict event creation and membership to the authenticated UCI user; unique membership and event capacity are enforced in the database. Cancelling an event removes its memberships. Chat and report/block controls remain local demo behavior. Existing sample-profile content and time labels are not database records.

## Campus map demo

Open `/map-demo` to choose a location for one of three fictional sample events. No Supabase configuration or login is needed. This page demonstrates the location field. The reusable location picker is also available in `/create-demo`; the backend event form currently uses a location text field. Backend event pages require authentication unless the isolated guest demo is enabled.

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

The real event creation form also offers 93 campus location suggestions: the six pinned landmarks plus building names and abbreviations from the UCI Registrar directory (`https://www.reg.uci.edu/addl/campus/index.old`, retrieved November 2, 2026). The checked-in snapshot is `src/lib/campus-building-directory.js`; it is not a live directory. Searches accept names, abbreviations, and building numbers. These building numbers are not map marker IDs. Only the verified landmarks open exact pins; other suggestions open an official map search. Saved canonical names preserve that behavior after reloading an event. The map demos retain their smaller verified-pin catalog and share-link import.

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

## Event discovery

Open `/events-demo` without signing in to try filtering four fictional events. This page does not publish events or join anyone to real plans. `/create-demo` now previews interest tags with the same validation as the real event form.

The real `/events` browser supports category, keyword, multiple interest tags (all must match), Today / Next 7 days / Upcoming, and open spots. Browse shows only future starts and sorts by start time. Tags on cards and event details link to a filtered browser. New events accept up to five tags of 24 characters; spaces become hyphens and duplicates are removed. Old events with no tags still work.

Apply `supabase/migrations/202611010001_event_tags.sql` before deploying the updated real creation form. Run `node --test tests/*.test.mjs` for the authentication, map, discovery, guest-mode, and social-link rules. The guest preview does not apply migrations or write to Supabase.

## Login-free guest demo

For a local demo with no Supabase configuration, copy `guest-demo.env` to `.env.local`, then build and start the app. Open `/` to use the normal home, discovery, event creation, agenda, friends, profiles and local chat. Login URLs redirect to the home page while guest mode is enabled.

Guest events, memberships, profile and friend requests stay in this browser under `anteract-guest-v1`; chat retains its separate local-demo storage. The banner identifies guest mode and offers Reset sample data. Sample invitations do not contact other people. If browser storage is unavailable, a notice explains that changes last until refresh.

`NEXT_PUBLIC_GUEST_MODE` defaults to false. Both Supabase variables must be absent for guest mode to activate. Setting either Supabase variable disables the guest bypass, so a configured backend continues to require UCI authentication. Do not copy the placeholder Supabase values from `.env.example` into a guest-only setup. This mode never supplies a real user session or writes to Supabase.

## Profile social media

The profile editor supports up to five optional social media links, with platform selectors, Add and Remove controls. Missing schemes normalize to HTTPS. Links appear on the student's profile and open in a new tab. Empty rows are ignored; duplicate links, non-HTTPS protocols and URLs containing credentials are rejected. Supported labels are Instagram, LinkedIn, Discord, X, TikTok, GitHub and Website.

Guest-mode links persist with the rest of the browser-local profile. Existing guest saves without social links remain valid. For real Supabase profiles, review and apply `supabase/migrations/202611010002_profile_social_links.sql` before deploying the updated profile form. No remote migration is run by this source package.
