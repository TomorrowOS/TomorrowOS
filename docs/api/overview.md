# TomorrowOS API Overview

TomorrowOS is a unified API layer for digital signage operating systems.

The goal is to give developers, CMS vendors and integrators one clean way to build signage apps, CMS players, widgets and device experiences across different platforms.

Instead of every project needing separate logic for Samsung Tizen, LG webOS, BrightSign OS, Android and browser-based signage runtimes, TomorrowOS provides a shared API surface with clear capability checks and fallback behaviour.

## Core API principle

Every TomorrowOS API should follow this principle:

> Check capability first. Execute safely second. Report clearly third.

This means a developer should be able to ask:

```ts
const support = await tomorrow.capabilities.check("display.power")
```

Then act safely:

```ts
if (support.status === "supported") {
  await tomorrow.display.power("off")
}
```

And report clearly if the feature is unsupported, partial, unsafe or requires a native bridge.

## Main API domains

| Domain | Purpose |
| --- | --- |
| Device API | Identify the screen, OS, model, firmware and runtime |
| Capability API | Check what a device can safely support |
| Playback API | Play images, videos, HTML, widgets and playlists |
| Transition API | Handle content changes without black gaps |
| Package API | Validate, install and activate ZIP/widget content |
| Asset API | Download, verify, cache and activate content safely |
| Sync API | Support multi-screen playback and video wall timing |
| Display API | Control supported screen functions |
| Network API | Understand connectivity and offline state |
| Telemetry API | Report health, heartbeat, logs and errors |
| Proof API | Capture proof-of-play and proof-of-display |
| Security API | Handle permissions, safe commands and trusted execution |
| Certification API | Test and prove OS/device/firmware support |

## Device API

The Device API provides basic information about the screen or player.

Example:

```ts
const device = await tomorrow.device.info()
```

Expected response:

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

The Capability API is the truth layer of TomorrowOS.

It tells the developer what is supported, unsupported, partial, model-dependent, firmware-dependent, unsafe or requires a native bridge.

Example:

```ts
const support = await tomorrow.capabilities.check("playback.video.h264")
```

Expected response:

```json
{
  "feature": "playback.video.h264",
  "status": "supported",
  "source": "tested",
  "notes": "Validated on QM43C running Tizen 7.0"
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

Potential methods:

```ts
tomorrow.capabilities.check(feature)
tomorrow.capabilities.checkMany(features)
tomorrow.capabilities.report()
tomorrow.capabilities.explain(feature)
```

## Playback API

The Playback API handles signage content.

It should support:

- Images
- Videos
- HTML
- Widgets
- Playlists
- Zones
- Schedules
- Fallbacks
- Recovery behaviour

Example:

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

The Transition API exists to stop black gaps, flickers and failed content handovers.

It should cover:

- Image to image
- Image to video
- Video to image
- Video to video
- Image to widget
- Widget to image
- Video to widget
- Widget to video
- Playlist to playlist
- Zone to zone

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

Potential methods:

```ts
tomorrow.transitions.prepare(from, to)
tomorrow.transitions.execute(options)
tomorrow.transitions.blackFrameGuard()
tomorrow.transitions.rollback()
```

## Package API

The Package API handles ZIP files, widgets and packaged signage apps.

Packages should be treated as untrusted until validated.

Example:

```ts
const result = await tomorrow.packages.validate("/packages/weather-widget.zip")
```

Potential package flow:

1. Upload package
2. Validate manifest
3. Check file types
4. Check package size
5. Check for unsafe paths
6. Extract safely
7. Verify entrypoint
8. Stage package
9. Activate package
10. Roll back on failure

Potential methods:

```ts
tomorrow.packages.validate(packagePath)
tomorrow.packages.install(packagePath)
tomorrow.packages.activate(packageId)
tomorrow.packages.rollback(packageId)
tomorrow.packages.remove(packageId)
```

## Asset API

The Asset API manages content files.

It should make sure content is downloaded, verified and ready before it appears on screen.

Example:

```ts
await tomorrow.assets.download({
  id: "promo_video",
  src: "https://example.com/promo.mp4",
  checksum: "sha256-example"
})
```

Potential methods:

```ts
tomorrow.assets.download(asset)
tomorrow.assets.verify(assetId)
tomorrow.assets.stage(assetId)
tomorrow.assets.activate(assetId)
tomorrow.assets.cleanup()
tomorrow.assets.getStorage()
```

Important behaviours:

- Checksum validation
- Partial download detection
- Local cache management
- Asset expiry
- Storage limits
- Atomic activation
- Fallback if activation fails

## Sync API

The Sync API handles multi-screen and video wall synchronisation.

It should support both simple and advanced use cases.

Example:

```ts
await tomorrow.sync.joinGroup("wall_01")

await tomorrow.sync.startAt({
  contentId: "hero_video",
  timestamp: "2026-01-01T10:00:00.000Z"
})
```

Potential methods:

```ts
tomorrow.sync.createGroup()
tomorrow.sync.joinGroup(groupId)
tomorrow.sync.leaveGroup(groupId)
tomorrow.sync.setRole("master")
tomorrow.sync.startAt(timestamp)
tomorrow.sync.measureDrift()
tomorrow.sync.correctDrift()
tomorrow.sync.getState()
```

Sync considerations:

- Time source
- NTP availability
- Master/follower mode
- Frame-accurate vs approximate sync
- Network jitter
- Drift correction
- Video wall panel mapping
- Bezel compensation
- Recovery when one screen drops offline

## Display API

The Display API handles screen-level controls where supported.

Example:

```ts
await tomorrow.display.setBrightness(80)
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

Important note:

Display control is often OS, model, firmware or bridge-dependent. These features should always go through the Capability API first.

## Network API

The Network API helps understand connectivity and offline behaviour.

Potential methods:

```ts
tomorrow.network.status()
tomorrow.network.getIpAddress()
tomorrow.network.getMacAddress()
tomorrow.network.testUrl(url)
tomorrow.network.detectCaptivePortal()
tomorrow.network.onOffline()
tomorrow.network.onReconnect()
```

Useful for:

- Offline detection
- Reconnect logic
- Content caching
- Playback fallback
- Captive portal issues
- DNS failures
- Network health reporting

## Telemetry API

The Telemetry API reports device and runtime health.

Example:

```ts
await tomorrow.telemetry.heartbeat()
```

Potential methods:

```ts
tomorrow.telemetry.heartbeat()
tomorrow.telemetry.log(event)
tomorrow.telemetry.error(error)
tomorrow.telemetry.metrics()
tomorrow.telemetry.screenshot()
tomorrow.telemetry.exportLogs()
```

Telemetry should cover:

- Online/offline state
- Current content
- App version
- Playback errors
- Package errors
- Storage pressure
- Memory pressure
- Runtime crashes
- Screenshots where supported
- Last successful sync
- Last successful proof-of-play

## Proof API

The Proof API captures evidence that content played or displayed.

Proof-of-play and proof-of-display should be treated separately.

Example:

```ts
await tomorrow.proof.recordPlay({
  contentId: "promo_video",
  playlistId: "lunch_menu",
  startedAt: new Date().toISOString(),
  durationMs: 15000
})
```

Potential methods:

```ts
tomorrow.proof.recordPlay(event)
tomorrow.proof.recordDisplay(event)
tomorrow.proof.captureScreenshot()
tomorrow.proof.export()
```

Proof types:

| Type | Meaning |
| --- | --- |
| Proof-of-play | The player attempted to play the content |
| Proof-of-display | Evidence the content was actually visible on screen |
| Screenshot proof | Visual capture where supported |
| Event proof | Timestamped playback event |
| Audit proof | Exportable record for reporting |

## Security API

The Security API should help keep local device control safe.

Potential methods:

```ts
tomorrow.security.getPermissions()
tomorrow.security.requestPermission(permission)
tomorrow.security.validateCommand(command)
tomorrow.security.getTrustState()
```

Security principles:

- No unauthenticated destructive control
- No hidden remote commands
- No logging secrets
- No customer data unless required
- Clear unsupported states
- Safe defaults
- Permissions where possible

## Certification API

The Certification API helps prove that a device, OS and firmware combination supports a capability.

Example:

```ts
const result = await tomorrow.certification.run({
  os: "tizen",
  model: "QM43C",
  firmware: "7.0"
})
```

Potential methods:

```ts
tomorrow.certification.run()
tomorrow.certification.runFeature(feature)
tomorrow.certification.exportReport()
tomorrow.certification.getHistory()
```

Certification should test:

- Image playback
- Video playback
- Codec support
- Widget loading
- ZIP package validation
- Transitions
- Black-gap prevention
- Asset download and checksum
- Atomic activation
- Offline fallback
- Sync timing
- Display controls
- Telemetry
- Proof-of-play
- Security boundaries

## Example full flow

```ts
import { tomorrow } from "@tomorrowos/sdk"

await tomorrow.ready()

const device = await tomorrow.device.info()

const support = await tomorrow.capabilities.checkMany([
  "playback.video.h264",
  "transition.video_to_image",
  "package.zip",
  "display.power",
  "proof.play"
])

await tomorrow.assets.download({
  id: "promo",
  src: "/assets/promo.mp4",
  checksum: "sha256-example"
})

await tomorrow.assets.verify("promo")

if (support["playback.video.h264"].status === "supported") {
  await tomorrow.playback.play({
    type: "video",
    assetId: "promo",
    fallback: "/assets/fallback.jpg",
    transition: "black-frame-safe"
  })

  await tomorrow.proof.recordPlay({
    contentId: "promo",
    startedAt: new Date().toISOString()
  })
} else {
  await tomorrow.playback.play({
    type: "image",
    src: "/assets/fallback.jpg"
  })
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

## Current status

This API overview is an early structure.

The next step is to convert each API domain into its own detailed page with:

- Purpose
- Methods
- Request examples
- Response examples
- Support status handling
- Failure modes
- Certification tests
