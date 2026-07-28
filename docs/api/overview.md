# TomorrowOS API Overview

TomorrowOS is a unified API layer for digital signage operating systems.

The goal is to give developers, CMS vendors and integrators one clean way to build signage apps, CMS players, widgets and device experiences across different platforms.

Instead of every project needing separate logic for each screen OS, TomorrowOS exposes a shared command surface. The CMS talks to devices over WebSocket using dotted method names such as `device.info.getCapabilities` and `device.content.setPolicy`. Platform details stay inside the player runtime.

## How `tos` is created

In the examples below, `tos` is a **TomorrowOS SDK instance**. It comes from constructing the `TomorrowOS` class exported by `@tomorrowos/sdk`:

```ts
import { TomorrowOS } from "@tomorrowos/sdk"

const tos = new TomorrowOS({
  // store, brand, and other CMS options
})

await tos.listen({ port: 8787 })
```

After that:

- `tos.device(deviceId).sendCommand(...)` sends a device command
- `tos.pairing.*` handles pairing
- `tos.playlists.*` manages playlists and policy publish

You can name the variable anything (`tomorrowos`, `client`, etc.). This overview uses `tos` as a short alias for the SDK instance.

## Core API principle

Every TomorrowOS API should follow this principle:

> Check capability first. Execute safely second. Report clearly third.

This means a developer should be able to ask:

```ts
const result = await tos.device(deviceId).sendCommand(
  "device.info.getCapabilities",
  {}
)

const caps = result.data.capabilities
```

Then act safely:

```ts
if (caps["device.display.setOnOffTimer"]?.supported) {
  await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
    onOffTimer: { turnOnAt: "08:00", turnOffAt: "22:00" }
  })
}
```

And report clearly if the feature is unsupported or failed on that device.

## Main API domains

| Domain | Purpose |
| --- | --- |
| Information API | Identify the screen and discover which `device.*` commands it supports |
| Playback API | Deliver playlists through content policy (`setPolicy` / `clear`) |
| Transition API | Keep content handovers smooth inside the player runtime |
| Asset API | Upload, cache and activate media before it appears on screen |
| Sync API | Keep reconnect, resume and policy push behaviour consistent |
| Display API | Control supported screen functions such as on/off timers |
| Network API | Understand connectivity through device online / heartbeat state |
| Telemetry API | Capture screenshots from the device |

## Information API

The Information API tells you what the device is, and what it can do.

Current methods:

```ts
device.info.get
device.info.getCapabilities
```

CMS helpers around the same domain:

```ts
tos.listDevices()
tos.setDeviceName(deviceId, "Lobby Left")
tos.device(deviceId).sendCommand(method, params)
```

### `device.info.get`

Returns basic identity and hardware information about the connected screen or player.

Example:

```ts
const result = await tos.device(deviceId).sendCommand("device.info.get", {})
```

Expected response `data`:

```json
{
  "online": true,
  "deviceId": "device_123",
  "model": "QM43C",
  "firmware": "T-KTM2ELAKUC",
  "serialNumber": "SN123456"
}
```

Use this to show device details in a CMS, store model / firmware metadata, or decide which devices need attention.

### `device.info.getCapabilities`

Returns which TomorrowOS device commands are supported on the connected runtime.

This is the capability check step before calling hardware-facing commands such as reboot, screenshot or on/off timer.

Example:

```ts
const result = await tos.device(deviceId).sendCommand(
  "device.info.getCapabilities",
  {}
)

const caps = result.data.capabilities
```

Expected response `data`:

```json
{
  "capabilities": {
    "device.info.get": { "supported": true },
    "device.power.reboot": { "supported": true },
    "device.content.setPolicy": { "supported": true },
    "device.content.clear": { "supported": true },
    "device.telemetry.captureScreen": { "supported": true },
    "device.display.setOnOffTimer": { "supported": true }
  }
}
```

Support statuses:

| Status | Meaning |
| --- | --- |
| `supported: true` | Works through the standard TomorrowOS command |
| `supported: false` | Not available on this runtime / device |
| Command failure | Supported in theory, but the call failed at runtime |

Always call `device.info.getCapabilities` before relying on reboot, screenshot, on/off timer or other hardware-facing commands.

## Playback API

TomorrowOS does not expose a low-level `play()` RPC for each media item.

Playback is driven by **content policy**. The CMS publishes playlists; the player applies them and handles images, videos, widgets, schedules and fallbacks.

Example:

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

Clear everything and return to brand fallback:

```ts
await tos.device(deviceId).sendCommand("device.content.clear", {})
```

Current methods:

```ts
device.content.setPolicy
device.content.clear
```

CMS helpers that build and push policy:

```ts
tos.playlists.savePlaylist({ name, items, schedule })
tos.playlists.publishPlaylistsToDevice(deviceId, playlistIds)
tos.playlists.buildPolicyForDevice(deviceId)
tos.pushLatestPolicyToDevice(deviceId)
tos.playlists.removePlaylistFromDevice(deviceId, playlistId)
tos.playlists.clearAllAssignmentsFromDevice(deviceId)
```

What the player handles after `setPolicy`:

- Images
- Videos
- Widgets / packaged HTML
- Playlist schedules
- Brand fallback
- Offline cache and recovery behaviour

## Transition API

The Transition API is not a separate public command today.

Transition behaviour lives inside the player when it moves between playlist items after `device.content.setPolicy`.

It covers:

- Image to image
- Image to video
- Video to image
- Video to video
- Image / video to widget
- Widget back to media
- Playlist handoff and resume after reconnect / reboot

Current surface:

```ts
# No public tomorrow.transitions.* command yet
# Transitions run automatically during policy playback
device.content.setPolicy
```

Design goal: prevent black gaps, flickers and failed content handovers without requiring CMS code to orchestrate each frame swap.

## Asset API

The Asset API manages content files on the CMS side and cache behaviour on the device side.

CMS apps upload and register media; the player downloads, verifies and activates assets before they appear on screen.

Example CMS flow:

```ts
# Upload / register media through the TomorrowOS CMS server
# then reference absolute media URLs inside playlist items

await tos.playlists.savePlaylist({
  name: "Promo",
  items: [
    {
      type: "video",
      url: "https://cms.example.com/media/promo.mp4",
      duration: 15000
    }
  ]
})

await tos.playlists.publishPlaylistsToDevice(deviceId, ["playlist_id"])
```

Important behaviours:

- Media upload and registration on the CMS
- Absolute URL rewriting when building device policy
- Local cache on the player
- Partial download / failed download handling
- Storage pressure and cleanup
- Atomic activation before visible playback
- Fallback if activation fails

Current surface:

```ts
# CMS media routes + playlist publish
# Device applies assets through:
device.content.setPolicy
device.content.clear
```

## Sync API

The Sync API today focuses on connection continuity rather than multi-screen video walls.

It covers pairing, reconnect, resume after reboot, and pushing the latest policy when a device comes back online.

Example:

```ts
const { deviceId } = await tos.pairing.verify("A4F2K1")

tos.on("device.online", async ({ deviceId }) => {
  await tos.pushLatestPolicyToDevice(deviceId)
})
```

Current methods / events:

```ts
tos.pairing.verify(code)
tos.pairing.unpair(deviceId)
tos.pushLatestPolicyToDevice(deviceId)

# Device / CMS wire events
device.hello
device.resume
device.ping / device.pong
device.online
device.offline
device.heartbeat
```

Sync considerations already handled in the runtime:

- Reconnect after network loss
- Resume after reboot
- Resume after re-pair
- Latest vs snapshot policy push
- Recovery when one screen drops offline

Frame-accurate video wall sync is not a public API yet.

## Display API

The Display API handles screen-level controls where supported.

Example:

```ts
await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
  onOffTimer: {
    turnOnAt: "08:00",
    turnOffAt: "22:00"
  }
})
```

Clear the timer:

```ts
await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
  onOffTimer: null
})
```

CMS helpers:

```ts
tos.setDeviceOnOffTimer(deviceId, {
  turnOnAt: "08:00",
  turnOffAt: "22:00"
})

tos.clearDeviceOnOffTimer(deviceId)
```

Current methods:

```ts
device.display.setOnOffTimer
device.power.reboot
```

Notes:

- `setOnOffTimer` uses daily `HH:mm` times (`turnOnAt` / `turnOffAt` must differ)
- When active, the panel can mute / unmute on schedule while the device stays connected
- `device.power.reboot` asks the device to reboot and resume afterwards where supported
- Display control is often model / firmware dependent — always check `device.info.getCapabilities` first

## Network API

The Network API helps understand connectivity and offline behaviour.

There is no separate `device.network.*` command set yet. Connectivity is observed through device presence and heartbeat.

Current surface:

```ts
tos.listDevices()              # includes online / offline state
device.ping / device.pong      # heartbeat
device.online
device.offline
device.heartbeat
```

Useful for:

- Offline detection
- Reconnect logic
- Content caching
- Playback fallback
- Network health reporting

## Telemetry API

The Telemetry API captures a screenshot from the device.

Example:

```ts
const result = await tos.device(deviceId).sendCommand(
  "device.telemetry.captureScreen",
  {}
)
```

Expected response `data` shape:

```json
{
  "screenshot": {
    "mimeType": "image/jpeg",
    "dataBase64": "...",
    "capturedAt": "2026-07-27T09:00:00.000Z",
    "width": 1920,
    "height": 1080
  }
}
```

Current method:

```ts
device.telemetry.captureScreen
```

Always check `device.info.getCapabilities` first. Screenshot support can vary by runtime and device.

## Example full flow

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

## API design rules

TomorrowOS APIs should be:

- Simple to read
- Easy to use
- Capability-first
- Honest about limitations
- Safe by default
- Clear when unsupported
- Practical for real signage deployments
- Useful across multiple OS environments
- Flexible enough for CMS vendors and integrators

## Summary

This API overview reflects the **shipped command surface** used by TomorrowOS apps today:

| Command | Role |
| --- | --- |
| `device.info.get` | Device identity / hardware info |
| `device.info.getCapabilities` | Capability discovery |
| `device.content.setPolicy` | Publish playlists / start playback |
| `device.content.clear` | Clear content / return to fallback |
| `device.power.reboot` | Reboot the device |
| `device.display.setOnOffTimer` | Daily panel on/off (mute) schedule |
| `device.telemetry.captureScreen` | Screenshot capture |

