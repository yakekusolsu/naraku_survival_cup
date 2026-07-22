# 奈落鯖サバイバルカップ Summer 2026 Official Website

大型 eSports 大会の公式サイトとして制作した Vue.js + Node.js 実運用スターターです。

## Stack

- Vue.js 3
- Composition API
- Vite
- Vue Router
- Pinia
- TypeScript
- TailwindCSS
- GSAP
- Three.js
- Lenis
- Node.js / Express
- Socket.IO
- OpenAPI / Swagger UI

## Architecture

```text
Minecraft Paper Server
  ↓
NSCCore Java Plugin
  ↓ REST / WebSocket
Node.js Express BFF
  ↓ REST / Socket.IO
Vue.js Official Website
```

## Pages

- Home
- Rules
- Schedule
- Ranking
- Teams
- Players
- News
- Map
- Shop
- Login
- My Page
- Admin
- API Docs
- 404

## Development

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:8787/api`

Swagger UI: `http://localhost:8787/api/swagger`

By default, ranking, players, teams, map markers and live events are empty until the Paper plugin or production API is connected.
For frontend-only visual demos, start the server with:

```bash
DEMO_DATA=true npm run dev
```

## Production Build

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env` and configure:

```text
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=/
PORT=8787
PLUGIN_REST_BASE_URL=http://localhost:8080
PLUGIN_REST_TOKEN=change-me
JWT_SECRET=change-me
```

## Integration Notes

The current server uses tournament mock data so the frontend can be developed immediately.
Replace the mock handlers in `server/index.ts` with calls to the Paper plugin REST API:

- `GET /api/ranking`
- `GET /api/player/{uuid}`
- `GET /api/team/{id}`
- `GET /api/events`
- `GET /api/season`
- `POST /api/admin/addPoint`
- `POST /api/admin/removePoint`
- `POST /api/admin/startEvent`
- `POST /api/admin/endEvent`

Forward plugin realtime events into Socket.IO events:

- `ranking_update`
- `player_update`
- `kill_event`
- `death_event`
- `supply_spawn`
- `boss_spawn`
- `event_start`
- `event_end`
- `announcement`
