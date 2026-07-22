# Architecture

## Frontend

```text
src/
  components/  Shared UI, animation, tables and layout
  data/        Development data used by frontend and server
  pages/       Route-level views
  router/      Vue Router configuration
  services/    REST API and Socket.IO client
  stores/      Pinia application state
  styles/      Tailwind and global motion system
  types/       Shared TypeScript contracts
```

## Backend

```text
server/
  index.ts     Express API, Socket.IO bridge, admin endpoints
  openapi.ts   OpenAPI document used by Swagger UI
```

## Auth Model

Production authentication should use:

- Discord OAuth authorization code flow
- HttpOnly session cookie or short-lived JWT
- Minecraft UUID account linking
- LuckPerms role synchronization
- Admin route guard on both frontend and backend

## Data Model

Primary DTOs live in `src/types/index.ts`.

- `TournamentOverview`
- `RankingPlayer`
- `Team`
- `NewsPost`
- `ScheduleItem`
- `MapMarker`
- `ShopItem`
- `LiveEvent`
- `ApiEndpoint`

## Realtime Sync

Paper plugin events should be normalized by the Node BFF and emitted to the browser with Socket.IO.

```text
Plugin point.updated     -> ranking_update / player_update
Plugin event.started     -> event_start
Plugin event.ended       -> event_end
Plugin boss notification -> boss_spawn
Plugin supply drop       -> supply_spawn
Plugin announcement      -> announcement
```

## Accessibility

- Keyboard-accessible navigation and controls
- Reduced motion support via `prefers-reduced-motion`
- High-contrast text over glass panels
- Semantic route headings
- Accessible form labels and image alt text
