# TomorrowOS Developer Guide

This guide is for developers building a CMS, integrating TomorrowOS into an existing app, or extending the Control Panel on top of `@tomorrowos/sdk`.

It describes **what exists today**: the Node CMS SDK, the WebSocket / HTTP wire protocol, and the Tizen / BrightSign players — not a future client runtime API.

For product-level context, see `docs/guides/beginners-guide.md`. For the full command list, see `docs/api/overview.md`.

## Requirements

| | |
| --- | --- |
| Node.js | **20** or newer |
| npm | 10 or newer (or a compatible client) |

`@tomorrowos/sdk` declares `"engines": { "node": ">=20" }`. The generated starters match that floor.

## Developer mindset

> Check capability first. Execute safely second. Report clearly third.

Screens differ by OS, model, firmware, media engine and permissions. Do not assume reboot, screenshot or on/off timer works until `device.info.getCapabilities` says so.

Do not invent helpers like `tomorrow.playback.play()` or `tomorrow.display.power("off")`. Use the SDK instance and dotted wire methods such as `device.content.setPolicy`.

## Architecture

```txt
Your CMS (@tomorrowos/sdk)
  HTTP: pairing, playlists, media, Control Panel
  WebSocket: device.* commands + uplink (ping, logs, hello)
        ↕
TomorrowOS player (Tizen / BrightSign)
  caches media, plays policy, reports capabilities
```

| Piece | Role |
| --- | --- |
| `TomorrowOS` class | CMS server: listen, store, pairing, playlists, device commands |
| Control Panel | UI over HTTP helpers (`/pairing/verify`, `/playlists`, …) |
| Player app | Runs on the panel; applies `device.content.setPolicy` |
| Store | SQLite (dev), Postgres / Supabase / Neon (production) |
| Media | Cloudinary, Vercel Blob, Replit Object Storage, or local uploads |

There is no required TomorrowOS cloud. Screens talk to **your** server.

## Scaffold and run

```bash
npx @tomorrowos/sdk@latest init my-cms
cd my-cms
npm install
```

Configure `.env` (and the same secrets on your host):

```bash
# Database (example: Supabase)
TOMORROWOS_STORE=supabase
SUPABASE_URL=postgresql://...@....supabase.co:5432/postgres
DATABASE_SSL=true

# Media (example: Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# optional: CLOUDINARY_FOLDER=tomorrowos
```

```bash
npm run dev
```

Deploy to a host with a **persistent Node.js runtime** and long-lived WebSockets (Railway, Render, Fly.io, a VPS, etc.). Avoid classic short-lived serverless without WebSocket support.

You get:

- Pairing HTTP (`POST /pairing/verify`, `POST /pairing/unpair`)
- `GET /brand.json`
- WebSocket device channel
- Media upload helpers
- `GET /players/brightsign.zip` (CMS URL baked into `config.js`)
- Starter Control Panel under `staticRoot`

### Add to an existing app

```ts
import { createTomorrowOSStore, TomorrowOS } from "@tomorrowos/sdk"

const store = createTomorrowOSStore({
  databaseUrl: process.env.SUPABASE_URL || process.env.DATABASE_URL
})

const tos = new TomorrowOS({ brand, store })

tos.listen({
  port: Number(process.env.PORT) || 3000,
  host: "0.0.0.0",
  staticRoot: "./public" // optional
})
```

Keep your auth, tenancy and UI. The SDK adds device sessions, pairing, playlist/policy delivery and optional static helpers.

## Install a player and pair

1. Deploy a public **HTTPS** CMS URL (or a tunnel while developing).
2. Control Panel → **Download Players** → Tizen or BrightSign.
3. Install on the device:
   - [Samsung Tizen](../os/tizen) — Custom App URL, USB sideload, or Device Manager
   - [BrightSign](../os/brightsign) — zip from **your** CMS embeds `cmsEndpoint`; copy to SD card root
4. Player shows a **6-character pairing code**.
5. Control Panel → Pair → submit the code (`POST /pairing/verify` or `tos.pairing.verify(code)`).
6. Device appears online. Upload media, save a playlist, **Publish**.

## Basic flow (shipped)

```ts
import { TomorrowOS } from "@tomorrowos/sdk"

const tos = new TomorrowOS({ /* store, brand, ... */ })
await tos.listen({ port: 8787 })

const { deviceId } = await tos.pairing.verify("A4F2K1")

const info = await tos.device(deviceId).sendCommand("device.info.get", {})
const capsResult = await tos.device(deviceId).sendCommand(
  "device.info.getCapabilities",
  {}
)
const caps = capsResult.data.capabilities

const playlist = await tos.playlists.savePlaylist({
  name: "Lobby",
  items: [
    { type: "image", url: "https://cdn.example.com/promo.jpg", duration: 8000 },
    { type: "video", url: "https://cdn.example.com/loop.mp4" }
  ]
})

if (caps["device.content.setPolicy"]?.supported) {
  // Publish verifies asset reachability, then pushes setPolicy
  await tos.playlists.publishPlaylistsToDevice(deviceId, [playlist.id])
}

if (caps["device.display.setOnOffTimer"]?.supported) {
  await tos.setDeviceOnOffTimer(deviceId, {
    turnOnAt: "08:00",
    turnOffAt: "22:00"
  })
}

if (caps["device.telemetry.captureScreen"]?.supported) {
  await tos.device(deviceId).sendCommand("device.telemetry.captureScreen", {})
}
```

Typical sequence:

1. Listen / deploy CMS  
2. Pair device  
3. Read `device.info.get` + `device.info.getCapabilities`  
4. Upload / register media  
5. Save playlist  
6. Publish → CMS verify URLs → `device.content.setPolicy`  
7. Player caches and plays (black-gap-safe handoffs inside the player)  
8. Optional: screenshot, reboot, on/off timer  
9. On failure / empty policy: brand idle fallback  

## How `tos` is created

```ts
import { TomorrowOS } from "@tomorrowos/sdk"

const tos = new TomorrowOS({
  // store, brand, and other CMS options
})

await tos.listen({ port: 8787 })
```

After that:

- `tos.device(deviceId).sendCommand(method, params)` — device wire commands  
- `tos.pairing.*` — pairing  
- `tos.playlists.*` — playlists and policy publish  
- `tos.listDevices()` — roster + online state  

Name the variable anything; docs use `tos` as a short alias.

## Capability checks

Always check before hardware-facing calls:

```ts
const result = await tos.device(deviceId).sendCommand(
  "device.info.getCapabilities",
  {}
)
const caps = result.data.capabilities

if (caps["device.power.reboot"]?.supported) {
  await tos.device(deviceId).sendCommand("device.power.reboot", {})
}
```

| Status | Meaning |
| --- | --- |
| `supported: true` | Works through the standard command |
| `supported: false` | Not available on this runtime / device |
| Command failure | Listed as supported, but the call failed at runtime |

Do not treat untested model/firmware as production-safe. Use certification evidence before claiming support.

## Information API

```ts
device.info.get
device.info.getCapabilities
```

`device.info.get` returns identity / hardware fields (model, firmware, serial, online, …). Use it in the CMS device detail view and for support tickets.

## Playback (content policy)

There is **no** low-level `play()` RPC per media item.

Playback is driven by **content policy**:

```ts
await tos.device(deviceId).sendCommand("device.content.setPolicy", {
  policy: {
    playlists: [
      {
        id: "lobby",
        name: "Lobby",
        items: [
          { type: "image", url: "https://cdn.example.com/promo.jpg", duration: 8000 },
          { type: "video", url: "https://cdn.example.com/loop.mp4" }
        ]
      }
    ]
  }
})
```

Clear and return to brand idle:

```ts
await tos.device(deviceId).sendCommand("device.content.clear", {})
```

Prefer CMS helpers that verify and build policy:

```ts
tos.playlists.savePlaylist({ name, items, schedule })
tos.playlists.publishPlaylistsToDevice(deviceId, playlistIds)
tos.playlists.buildPolicyForDevice(deviceId)
tos.pushLatestPolicyToDevice(deviceId)
tos.playlists.removePlaylistFromDevice(deviceId, playlistId)
tos.playlists.clearAllAssignmentsFromDevice(deviceId)
```

Or Control Panel: `POST /device/{deviceId}/assignments`.

Wire methods:

```txt
device.content.setPolicy
device.content.clear
```

## Assets and atomic activation

There is **no** separate `tomorrow.assets.*` command surface.

Flow today:

```txt
CMS upload / register
  → playlist items (absolute URLs + optional contentHash)
    → publish gate (CMS verifies URLs reachable)
      → device.content.setPolicy
        → player download / cache / play
```

See `docs/guides/assets-and-atomic-activation.md`.

## Transitions and black gaps

After `setPolicy`, the **player** owns image/video handoffs (dual layers, dual AVPlay / dual `roVideoPlayer`, prefetch, still-mode, etc.).

See `docs/guides/black-gap-playback.md` for image → image, image → video, video → image, video → video, and loop behaviour on Tizen and BrightSign.

## Pairing, sync and reconnect

```ts
const { deviceId } = await tos.pairing.verify("A4F2K1")
await tos.pairing.unpair(deviceId)

tos.on("device.online", async ({ deviceId }) => {
  await tos.pushLatestPolicyToDevice(deviceId)
})
```

Wire / events you will see:

```txt
device.hello
device.resume
device.ping / device.pong
device.online / device.offline / device.heartbeat
```

This sync layer is about **connection continuity** (reconnect, reboot resume, re-pair, latest policy push) — not frame-accurate video walls.

`device.ping` / `device.pong` are uplink heartbeats, not an HTTP ping API you call from the Control Panel.

## Display and power

```ts
await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
  onOffTimer: { turnOnAt: "08:00", turnOffAt: "22:00" }
})

await tos.setDeviceOnOffTimer(deviceId, {
  turnOnAt: "08:00",
  turnOffAt: "22:00"
})
await tos.clearDeviceOnOffTimer(deviceId)

await tos.device(deviceId).sendCommand("device.power.reboot", {})
```

Wire methods:

```txt
device.display.setOnOffTimer
device.power.reboot
```

Notes:

- Timer uses daily `HH:mm`; `turnOnAt` / `turnOffAt` must differ  
- Often model / firmware dependent — check capabilities first  
- There is no shipped `device.display.power("off")` brightness/volume API today  

## Telemetry

Screenshot:

```ts
const result = await tos.device(deviceId).sendCommand(
  "device.telemetry.captureScreen",
  {}
)
// result.data.screenshot: { mimeType, dataBase64, capturedAt, width, height }
```

Also available via `POST /device/{id}/screenshot`.

Wire method:

```txt
device.telemetry.captureScreen
```

Player logs uplink as `device.log`; read them with `GET /device/{id}/logs`.

## Network / presence

No separate `device.network.*` command set.

Use:

```ts
tos.listDevices() // online / offline
// plus device.ping / pong and online / offline events
```

## Shipped device command surface

| Command | Role |
| --- | --- |
| `device.info.get` | Identity / hardware info |
| `device.info.getCapabilities` | Capability discovery |
| `device.content.setPolicy` | Publish playlists / start playback |
| `device.content.clear` | Clear content / brand idle |
| `device.power.reboot` | Reboot |
| `device.display.setOnOffTimer` | Daily on/off (mute) schedule |
| `device.telemetry.captureScreen` | Screenshot |

Uplink-only (player → CMS): `device.ping`, `device.log`, `device.hello`, `device.resume`, …

## Error handling

Prefer structured results from `sendCommand` (ok / error / unsupported) and CMS publish verification failures before policy push.

Common field / support issues:

```txt
asset URL not reachable (publish gate)
unsupported command on this runtime
first-frame / decode failure (player falls back or keeps last good)
storage / download failure on device
device offline (command cannot be delivered)
```

When something fails after a successful publish, players keep last known good media when possible, or show brand idle from `GET /brand.json`.

## Security expectations

- Do not expose unauthenticated admin routes  
- Do not log secrets or credentials  
- Keep pairing behind your Control Panel auth  
- Treat unknown capability as unsupported until tested  
- Be careful storing / transmitting screenshots  

Follow project `SECURITY.md` where applicable.

## Production checklist

- Exact device model + firmware tested  
- Public HTTPS CMS reachable from the screen network  
- Durable database + media storage (not ephemeral local disk)  
- Publish verification passes for every playlist asset  
- Offline / reboot resume  
- Black-gap transitions for your real media mix (see black-gap guide)  
- Capabilities verified per fleet type  
- Pairing, publish, screenshot, reboot paths exercised end-to-end  

## Related docs

| Doc | Use when |
| --- | --- |
| `docs/api/overview.md` | Full API reference |
| `docs/guides/beginners-guide.md` | Product / setup overview |
| `docs/guides/assets-and-atomic-activation.md` | Publish gate + player cache |
| `docs/guides/black-gap-playback.md` | Image/video handoffs on Tizen & BrightSign |
| `@tomorrowos/sdk` README | Scaffold, hosts, architecture |
| `docs/os/tizen.md` | Samsung Tizen install and platform notes |
| `docs/os/brightsign.md` | BrightSign install and platform notes |

## Goal

One CMS ↔ player contract, honest capabilities, safe publish and player-owned transitions — without pretending every signage OS is the same.

Write against the **shipped** wire methods. Keep platform details inside the player. Document what you actually certified on real hardware.
