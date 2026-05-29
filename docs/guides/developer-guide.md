# TomorrowOS Developer Guide

TomorrowOS is an open source unified API layer for digital signage operating systems.

This guide is for developers building signage apps, CMS players, widgets, connectors, device integrations or tools on top of TomorrowOS.

## Developer mindset

TomorrowOS should be built around one simple rule:

> Check capability first. Execute safely second. Report clearly third.

Digital signage operating systems do not behave the same way.

A feature may work on one device but fail on another because of:

- Operating system
- Device model
- Firmware version
- Browser engine
- Media engine
- Native API access
- App permissions
- Storage limits
- Network conditions
- Runtime environment
- Whether a bridge or agent is available

Do not assume a feature is available.

Always check capabilities first.

## Basic flow

A typical TomorrowOS app should follow this flow:

1. Wait for TomorrowOS runtime
2. Read device information
3. Check required capabilities
4. Validate assets or packages
5. Stage content
6. Activate content safely
7. Monitor playback
8. Report telemetry
9. Record proof events
10. Fall back when something fails

Example:

```ts
import { tomorrow } from "@tomorrowos/sdk"

await tomorrow.ready()

const device = await tomorrow.device.info()

const support = await tomorrow.capabilities.checkMany([
  "playback.image.jpg",
  "playback.video.h264",
  "transition.video_to_image",
  "asset.atomic_activation",
  "proof.play"
])

if (support["playback.video.h264"].status === "supported") {
  await tomorrow.playback.play({
    type: "video",
    src: "/assets/promo.mp4",
    fallback: "/assets/fallback.jpg",
    transition: "black-frame-safe"
  })
} else {
  await tomorrow.playback.play({
    type: "image",
    src: "/assets/fallback.jpg"
  })
}
```

## Installation

The intended developer flow is:

```bash
npx @tomorrowos/sdk init my-signage-app
cd my-signage-app
npm install
npm run dev
```

This project is still in early development, so package names, install commands and SDK behaviour may change before v1.0.

## Runtime readiness

A TomorrowOS app should wait for the runtime before calling APIs.

```ts
await tomorrow.ready()
```

This ensures the runtime, connector, bridge or browser environment has had a chance to initialise.

## Device API

Use the Device API to understand the current device and runtime.

```ts
const device = await tomorrow.device.info()
```

Example response:

```json
{
  "id": "device_123",
  "os": "tizen",
  "osVersion": "7.0",
  "model": "QM43C",
  "firmware": "T-KTM2ELAKUC",
  "manufacturer": "Samsung",
  "orientation": "landscape",
  "runtime": "browser"
}
```

Potential methods:

```ts
tomorrow.device.info()
tomorrow.device.identify()
tomorrow.device.getModel()
tomorrow.device.getFirmware()
tomorrow.device.getRuntime()
tomorrow.device.restartApp()
tomorrow.device.reboot()
```

## Capability API

The Capability API is the most important TomorrowOS API.

Use it before calling any feature that may not be supported everywhere.

```ts
const support = await tomorrow.capabilities.check("display.power")
```

Example response:

```json
{
  "feature": "display.power",
  "status": "model-dependent",
  "source": "tested",
  "notes": "Supported on tested commercial display models only."
}
```

Support statuses:

| Status | Meaning |
| --- | --- |
| `supported` | Works through the standard TomorrowOS API |
| `unsupported` | Not available on this OS/device |
| `partial` | Works, but with known limits |
| `model-dependent` | Depends on the exact hardware model |
| `firmware-dependent` | Depends on firmware or OS version |
| `requires-bridge` | Requires an agent, native bridge or platform-specific layer |
| `unsafe` | Possible, but not recommended |
| `unknown` | Not yet tested |

Example:

```ts
const support = await tomorrow.capabilities.checkMany([
  "playback.video.h264",
  "package.zip",
  "display.power",
  "telemetry.screenshot"
])

for (const [feature, result] of Object.entries(support)) {
  console.log(feature, result.status)
}
```

## Playback API

The Playback API should handle images, videos, HTML, widgets and playlists.

Example image playback:

```ts
await tomorrow.playback.play({
  type: "image",
  src: "/assets/menu.jpg",
  durationMs: 10000,
  transition: "fade"
})
```

Example video playback:

```ts
await tomorrow.playback.play({
  type: "video",
  src: "/assets/promo.mp4",
  fallback: "/assets/fallback.jpg",
  transition: "black-frame-safe"
})
```

Potential methods:

```ts
tomorrow.playback.play(content)
tomorrow.playback.stop()
tomorrow.playback.pause()
tomorrow.playback.resume()
tomorrow.playback.getState()
tomorrow.playback.setPlaylist(playlist)
tomorrow.playback.restoreLastKnownGood()
```

## Transition API

Transitions should be designed to prevent black gaps.

A black-gap-safe transition should not remove current content until the next content is ready.

Example:

```ts
await tomorrow.transitions.execute({
  from: "current",
  to: "next",
  mode: "black-frame-safe",
  preload: true,
  requireFirstFrame: true,
  fallback: "/assets/fallback.jpg",
  timeoutMs: 3000
})
```

Transition types to test:

```txt
transition.image_to_image
transition.image_to_video
transition.video_to_image
transition.video_to_video
transition.image_to_widget
transition.widget_to_image
transition.video_to_widget
transition.widget_to_video
transition.playlist_to_playlist
transition.zone_to_zone
```

## Asset API

Use the Asset API to download, verify, stage and activate files safely.

Example:

```ts
await tomorrow.assets.download({
  id: "promo_video_001",
  src: "https://example.com/assets/promo.mp4",
  checksum: "sha256-example",
  sizeBytes: 24500000
})

await tomorrow.assets.verify("promo_video_001")
await tomorrow.assets.stage("promo_video_001")
```

Important behaviours:

- Download retry
- Checksum validation
- Partial download detection
- Storage pressure checks
- Local caching
- Expiry
- Cleanup
- Atomic activation
- Last known good recovery

## Package API

Use the Package API for ZIP files, widgets and packaged signage apps.

Example:

```ts
const validation = await tomorrow.packages.validate("/packages/weather-widget.zip")

if (validation.ok) {
  const installed = await tomorrow.packages.install("/packages/weather-widget.zip")

  await tomorrow.packages.activate(installed.packageId, {
    mode: "atomic",
    fallback: "/assets/fallback.jpg"
  })
}
```

Package flow:

1. Validate file type
2. Validate package size
3. Extract safely
4. Check for unsafe paths
5. Validate manifest
6. Confirm entrypoint
7. Confirm required assets
8. Check permissions
9. Stage package
10. Activate package
11. Roll back on failure

## Sync API

Use the Sync API for multi-screen and video wall behaviour.

Example:

```ts
await tomorrow.sync.joinGroup("wall_01")

await tomorrow.sync.startAt({
  contentId: "hero_video",
  timestamp: "2026-01-01T10:00:00.000Z"
})
```

Sync should account for:

- Time source
- NTP availability
- Master/follower mode
- Drift measurement
- Drift correction
- Video wall mapping
- Bezel compensation
- Network jitter
- Screen drop-off recovery

## Display API

Display controls should always be capability-checked first.

Example:

```ts
const powerSupport = await tomorrow.capabilities.check("display.power")

if (powerSupport.status === "supported") {
  await tomorrow.display.power("off")
}
```

Potential methods:

```ts
tomorrow.display.power("on")
tomorrow.display.power("off")
tomorrow.display.setBrightness(80)
tomorrow.display.getBrightness()
tomorrow.display.setOrientation("portrait")
tomorrow.display.getOrientation()
tomorrow.display.setVolume(20)
tomorrow.display.mute()
tomorrow.display.getPanelStatus()
```

## Telemetry API

Telemetry should help developers and operators understand what is happening.

Example:

```ts
await tomorrow.telemetry.heartbeat()

await tomorrow.telemetry.log({
  type: "playback.started",
  contentId: "promo_video_001"
})
```

Telemetry should cover:

- Heartbeat
- Online/offline state
- Current content
- Current playlist
- App version
- Runtime version
- Playback errors
- Package errors
- Asset errors
- Storage pressure
- Memory pressure
- Screenshots where supported
- Last successful proof-of-play

## Proof API

Proof-of-play and proof-of-display should be separate.

Example proof-of-play:

```ts
await tomorrow.proof.recordPlay({
  contentId: "promo_video_001",
  playlistId: "lunch_menu",
  startedAt: new Date().toISOString(),
  durationMs: 15000
})
```

Example proof-of-failure:

```ts
await tomorrow.proof.recordFailure({
  contentId: "promo_video_001",
  reason: "first_frame_timeout",
  fallbackUsed: true,
  timestamp: new Date().toISOString()
})
```

Proof types:

| Type | Meaning |
| --- | --- |
| Proof-of-play | The player attempted to play content |
| Proof-of-display | Evidence the content appeared on screen |
| Proof-of-failure | The content failed and fallback was used |
| Screenshot proof | Visual evidence where supported |
| Audit proof | Exportable event record |

## Error handling

Errors should be structured, searchable and useful.

Example:

```json
{
  "type": "playback.failure",
  "feature": "playback.video.h264",
  "reason": "unsupported_codec",
  "contentId": "promo_video_001",
  "os": "tizen",
  "model": "QM43C",
  "firmware": "7.0",
  "fallbackUsed": true,
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

Common failure reasons:

```txt
asset_missing
asset_download_failed
asset_partial_download
asset_checksum_failed
unsupported_codec
unsupported_file_type
first_frame_timeout
widget_entrypoint_missing
widget_timeout
widget_runtime_error
package_manifest_invalid
storage_full
memory_pressure
network_unavailable
transition_timeout
sync_failed
unsupported_feature
requires_bridge
unknown_runtime_error
```

## Security expectations

Developers should avoid unsafe device control.

Do not:

- Expose unauthenticated local APIs
- Log secrets or credentials
- Accept unsafe ZIP paths
- Activate unvalidated packages
- Run destructive commands silently
- Treat unknown capability as supported
- Collect customer data unnecessarily
- Assume screenshots are safe to store or transmit

Follow `SECURITY.md` for security reporting and project expectations.

## Production checklist

Before production use, test:

- Exact device model
- Exact firmware version
- Runtime/browser engine
- Required capabilities
- Image playback
- Video playback
- Widget playback
- ZIP package validation
- Asset download
- Checksum failure
- Atomic activation
- Black-gap transitions
- Offline behaviour
- Last known good recovery
- Telemetry events
- Proof events
- Security boundaries

## Contributing as a developer

Before opening a pull request:

- Keep changes focused
- Update documentation
- Include tests where possible
- Include device, OS and firmware evidence for capability claims
- Do not include secrets, customer data or private SDK material
- Mark uncertain capability claims as `unknown`, `partial`, `model-dependent`, `firmware-dependent` or `requires-bridge`

See `CONTRIBUTING.md` for the full contribution guide.

## Goal

TomorrowOS should make signage development simpler without pretending signage operating systems are all the same.

The goal is one clean API with honest capability mapping, safe playback handling, strong fallback behaviour and clear reporting.
