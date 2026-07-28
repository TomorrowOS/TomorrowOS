# Asset Download, Cache and Atomic Activation

TomorrowOS makes sure content is reachable, cached and ready before it replaces what is already on screen.

There is **no separate** `tomorrow.assets.*` command surface today. Assets move through the CMS media routes and the device content policy:

```txt
CMS upload / register
  → playlist items (absolute media URLs + optional contentHash)
  → publish gate (CMS verifies assets are reachable)
  → device.content.setPolicy
  → player download / cache / play
```

This guide describes that **shipped** flow in `@tomorrowos/sdk` and the TomorrowOS players (Tizen / BrightSign), not a fictional Asset SDK.

## Why asset handling matters

A signage screen may need to play:

- Images
- Videos
- HTML widgets / ZIP packages
- Brand fallback / idle content

If assets are not handled properly, screens can show black frames, broken media, half-loaded widgets, or incomplete playlists.

TomorrowOS prevents the worst cases by:

1. Verifying assets on the **CMS** before publish
2. Pushing a complete **policy** to the device
3. Caching media on the **player** (URL + content hash)
4. Switching playlists only when the next content can play (atomic handoff)
5. Falling back to **brand idle** when nothing playable is available

## Core principle

> Verify on publish. Cache on the device. Keep good content on screen until the next item is ready.

Content does not become “live” merely because a CMS button was clicked. The publish path checks reachability first; the player then downloads/caches and only hands off when playback can continue safely.

## End-to-end lifecycle (current)

1. Operator uploads media in the Control Panel (`/media/upload*`, Cloudinary direct, or Vercel Blob).
2. CMS stores an asset record (`url`, optional `contentHash` / sha256, mime type).
3. Operator builds a playlist with absolute `https://…` item URLs (or `/uploads/…` rewritten with `mediaBaseUrl` at publish).
4. On **Publish**, the panel calls `verifyPlaylistsAssetsReady` — HEAD/GET probe each resolved URL.
5. If verification fails, publish stops. No `setPolicy` is sent.
6. If verification succeeds, CMS builds device policy and sends `device.content.setPolicy` over WebSocket.
7. Player persists the policy snapshot (`tomorrowos.cachedPolicy`), rebuilds the download queue, and starts / continues playback.
8. Media is fetched into local cache (by URL and by content-hash dedup where available).
9. Playlist / item handoffs keep the current frame until the next item is ready (prefetch / first-frame rules).
10. On failure or empty policy, player shows **brand fallback** idle — not a black empty stage when avoidable.
11. Offline / resume: player may `hydratePlaybackFromCache` from the last persisted policy.

## What the CMS owns

### Media upload backends

Configured via env (priority order in the SDK):

| Backend | How it is selected | Resulting URL shape |
| --- | --- | --- |
| Cloudinary | `CLOUDINARY_*` set | `https://res.cloudinary.com/...` |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` / `TOMORROWOS_MEDIA=vercel-blob` | `https://*.public.blob.vercel-storage.com/...` |
| Replit Object Storage | Replit + `TOMORROWOS_MEDIA=replit-object-storage` | `/uploads/...` served from App Storage |
| Local disk | Fallback when no remote media backend | `/uploads/...` (ephemeral on many hosts) |

Routes:

- `GET /media/upload-capabilities`
- `POST /media/upload`
- `GET /media/upload-sign` + `POST /media/register` (Cloudinary direct)
- `POST /media/upload-init` → `upload-chunk` → `upload-complete` (chunked proxy)

### Playlist item shape (simplified)

```json
{
  "type": "video",
  "url": "https://res.cloudinary.com/demo/video/upload/promo.mp4",
  "name": "promo.mp4",
  "duration": 15000,
  "contentHash": "optional-sha256-or-etag"
}
```

Players prefer absolute HTTPS URLs. Relative `/uploads/...` URLs need a reachable CMS origin (or `mediaBaseUrl` at publish).

### Publish gate (atomic before the wire)

Before `POST /device/{deviceId}/assignments`, the Control Panel:

1. Refreshes playlists from `GET /playlists`
2. Rejects empty playlists
3. Resolves each item URL (including `mediaBaseUrl` when needed)
4. Probes each asset (`verifyPlaylistsAssetsReady`)
5. Only then publishes playlist IDs to the device

That is the CMS-side half of atomic activation: **do not push a policy whose media is already unreachable**.

Example (conceptual):

```ts
// Control Panel (methods.js) — not a public SDK method named assets.verify
const verification = await verifyPlaylistsAssetsReady(selectedPlaylists, mediaBaseUrl)
if (!verification.ok) {
  // stop — show failures; do not call /device/.../assignments
}

await fetch(`/device/${deviceId}/assignments`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ playlistIds, mediaBaseUrl })
})
```

## What the device owns

### Wire commands

| Method | Role |
| --- | --- |
| `device.content.setPolicy` | Deliver full policy (playlists, schedules, fallback). Triggers cache + playback sync. |
| `device.content.clear` | Stop playback, clear policy cache / download queue, show brand idle. |

HTTP wrappers used by the Control Panel:

- `POST /device/{deviceId}/assignments` → builds policy → `device.content.setPolicy`
- `POST /device/{deviceId}/content/set-policy` → raw policy push
- `POST /device/{deviceId}/content/clear` → `device.content.clear`
- `DELETE /device/{deviceId}/assignments` → clear assignments + push empty/brand policy

There are **no** device methods named `device.assets.download` / `stage` / `activate` today. Caching is internal to the player runtime after `setPolicy`.

### Player cache behaviour

On `device.content.setPolicy` the player typically:

1. Saves a policy snapshot for offline resume
2. Rebuilds a **playlist download queue** for media URLs in the policy
3. Downloads missing files into local storage
4. Indexes cache by **URL** and by **content-hash / dedup keys** when present (same bytes under a new CDN URL can hit cache)
5. Runs a background download worker without tearing down the current frame
6. Prefetches the next image on a back layer where relevant (black-gap avoidance)

Partial or failed downloads are not treated as playable cache hits. Playback continues with whatever is already good; missing items may be skipped or fall through to brand fallback depending on the active playlist state.

### Atomic activation on the device

“Atomic” here means **playlist / item handoff**, not a separate activate API:

1. Receive new policy
2. Persist snapshot
3. Keep current content visible when possible (`hotUpdate` for same active playlist)
4. Queue downloads for new URLs
5. Pick the active playlist (schedules + always-on rules)
6. Switch only through content handoff paths that wait for the next item to be ready
7. If nothing playable remains → brand fallback idle
8. Report `command.result` success/failure for the `setPolicy` command itself

The player does **not** wipe the screen to black merely because a new policy arrived. See also `docs/guides/black-gap-playback.md`.

## Last known good and fallback

| Layer | What TomorrowOS keeps |
| --- | --- |
| Policy snapshot | Last successful `setPolicy` payload in `localStorage` (`tomorrowos.cachedPolicy`) |
| Media files | Local video/image/widget cache indexes |
| Visual fallback | Brand idle / activation screen from `GET /brand.json` |

When policy is empty, clear is called, or no playable playlist exists, the player shows **brand fallback** — not a CMS-supplied emergency playlist API.

`device.content.clear` explicitly:

- Clears download queues and in-flight markers
- Clears the policy cache
- Stops playback
- Shows brand idle

## Offline behaviour

Screens should keep playing when the CMS is unreachable:

- Resume from cached policy after reboot / orientation reload / re-pair (`hydratePlaybackFromCache`)
- Serve media from local cache when the network path fails
- Reconnect WebSocket (`device.hello` / `device.resume`) and accept a newer `setPolicy` when online again
- Do not treat an incomplete CMS publish as applied (CMS publish gate already blocked it)

## Storage pressure and cleanup

Current players prune / manage cache indexes as new policies arrive and downloads complete. Behaviour is implementation-defined per platform (Tizen file APIs, BrightSign storage, etc.).

There is **no** public `assets.getStorage()` / `assets.cleanup()` method yet. Cleanup must not delete:

- Files still referenced by the active policy
- The policy snapshot used for resume
- Brand assets required for idle

## Failure modes (practical)

| Situation | Typical behaviour |
| --- | --- |
| Publish verify fails | Panel stops; device keeps previous policy |
| `setPolicy` while unpaired | Player ignores (`not_paired`) |
| Media URL 404 after publish | Item fails to cache; playlist may skip / fall back |
| Decoder / codec failure | Item fails; handoff / fallback paths run |
| CMS offline mid-play | Cached policy + local files continue |
| `content/clear` | Brand idle |

Device logs may surface via uplink `device.log`; screenshots via `device.telemetry.captureScreen` (HTTP: `POST /device/{id}/screenshot`).

## Capability checks

Discover support with:

```ts
device.info.getCapabilities
```

Relevant **shipped** capabilities include content policy commands, for example:

```txt
device.content.setPolicy
device.content.clear
```

Older docs listed aspirational names such as `asset.download`, `asset.stage`, `asset.atomic_activation`. Those are **design goals / certification checklists**, not separate wire methods in protocol 1.0. Atomic activation is behaviour inside `setPolicy` + player runtime.

## API examples (current)

Upload on CMS (panel / server routes), then:

```ts
await tos.playlists.savePlaylist({
  name: "Promo",
  items: [
    {
      type: "video",
      url: "https://cms.example.com/uploads/promo.mp4",
      duration: 15000
    }
  ]
})

// After panel verify gate:
await tos.playlists.publishPlaylistsToDevice(deviceId, [playlistId], {
  mediaBaseUrl // optional when items are relative
})
```

Which results in the device receiving:

```ts
device.content.setPolicy  // params.policy = built policy
```

Clear:

```ts
// HTTP
POST /device/{deviceId}/content/clear

// Wire
device.content.clear
```

## Certification tests (aligned to current behaviour)

Minimum tests:

- Image / video upload to configured media backend
- Publish blocked when an asset URL is unreachable
- Publish succeeds and device receives `setPolicy`
- Player caches media and plays without black gap on item handoff
- Hot update of the active playlist without full black clear
- Offline resume from cached policy
- `content/clear` → brand idle
- Relative `/uploads/` URLs with correct `mediaBaseUrl`
- Cloudinary / Blob absolute URLs play on-device
- Failed download does not replace good on-screen content prematurely

## Goal

TomorrowOS should make content activation safe and predictable.

The goal is not a separate Asset microservice API.

The goal is: **reachable media → verified publish → durable policy push → local cache → seamless handoff → brand-safe fallback**.
