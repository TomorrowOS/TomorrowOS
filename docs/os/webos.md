# LG webOS

This page documents TomorrowOS support considerations for LG webOS-based commercial signage displays.

LG webOS is a major digital signage operating system used across commercial display networks. TomorrowOS should treat webOS as a first-class signage platform, while still being honest that support can vary by model, firmware, webOS version, runtime and API access.

## Purpose

The purpose of this page is to track how TomorrowOS should approach LG webOS support across:

- Device identification
- Runtime capability
- Browser engine behaviour
- Image playback
- Video playback
- Widget playback
- ZIP/package handling
- Asset storage
- Display control
- Screenshots
- Telemetry
- Proof-of-play
- Proof-of-display
- Synchronisation
- Security
- Certification testing

## Core principle

webOS support should never be assumed universally.

A feature may depend on:

- LG display model
- webOS version
- Firmware version
- Commercial display generation
- Browser engine version
- App packaging method
- App permissions
- Signage API access
- Whether a native bridge is available
- Whether the app is running as a hosted app, packaged app or signage player
- Whether the device is being used in portrait, landscape or video wall mode

Every webOS feature should be validated through the Capability API before use.

Example:

```ts
const support = await tomorrow.capabilities.check("display.power")

if (support.status === "supported") {
  await tomorrow.display.power("off")
}
```

## Recommended support status approach

webOS features should usually start as:

```txt
unknown
```

Then move to one of the following only after evidence:

```txt
supported
partial
model-dependent
firmware-dependent
requires-bridge
unsupported
unsafe
```

Do not mark a webOS capability as `supported` unless it has been tested on a real model and firmware version.

## Device identification

TomorrowOS should attempt to identify:

- Manufacturer
- Device model
- webOS version
- Firmware version
- Serial number, where available
- Display orientation
- Screen resolution
- Runtime type
- App version
- Storage availability
- Network state

Example capability names:

```txt
device.info
device.model
device.firmware
device.os_version
device.serial
device.orientation
device.resolution
device.storage
```

Example API:

```ts
const device = await tomorrow.device.info()
```

Example response:

```json
{
  "manufacturer": "LG",
  "os": "webos",
  "osVersion": "example-version",
  "model": "example-model",
  "firmware": "example-firmware",
  "orientation": "landscape",
  "runtime": "browser"
}
```

## Runtime considerations

webOS signage apps may run in different ways depending on deployment method.

Possible runtime types:

- Hosted web app
- Packaged web app
- Signage app
- Browser-based player
- CMS player runtime
- Native bridge-assisted runtime

TomorrowOS should document which runtime is being tested.

Capability support may change depending on runtime.

Example:

```json
{
  "feature": "display.power",
  "os": "webos",
  "status": "model-dependent",
  "runtime": "packaged-signage-app",
  "notes": "Power control may depend on model, firmware and signage API access."
}
```

## Browser engine behaviour

webOS browser and web app support can vary by version and firmware.

TomorrowOS should track:

- JavaScript support
- CSS support
- HTML5 video support
- Web storage support
- Canvas support
- WebGL support
- WebSocket support
- Fetch/XHR support
- Service worker support, if available
- Autoplay behaviour
- Media decoder behaviour
- Memory limits
- Browser crash behaviour

Relevant capability names:

```txt
runtime.javascript
runtime.css
runtime.html5_video
runtime.canvas
runtime.webgl
runtime.websocket
runtime.fetch
runtime.local_storage
runtime.service_worker
runtime.media_autoplay
runtime.memory_limit
```

## Image playback

webOS image support should be tested by model and firmware.

Track support for:

- JPG
- PNG
- WebP
- SVG
- GIF
- Transparency
- Large image files
- High-resolution images
- Aspect ratio scaling
- Portrait rotation
- Landscape rotation
- Memory pressure behaviour

Capability examples:

```txt
playback.image.jpg
playback.image.png
playback.image.webp
playback.image.svg
playback.image.gif
playback.image.transparency
playback.image.large_file
playback.image.scaling
```

Recommended tests:

- Load simple JPG
- Load simple PNG
- Load transparent PNG
- Load large image
- Load unsupported image type
- Switch image to image
- Switch image to video
- Confirm fallback image works

## Video playback

Video playback should be treated as a high-risk area.

Track support for:

- MP4
- H.264
- H.265
- WebM
- VP9
- AV1
- MOV
- Resolution limits
- Bitrate limits
- Frame rate limits
- Muted autoplay
- Looping
- First-frame readiness
- Hardware decoding
- Decoder failure
- Audio behaviour
- Black frame at start
- Black frame at end

Capability examples:

```txt
playback.video.mp4
playback.video.h264
playback.video.h265
playback.video.webm
playback.video.vp9
playback.video.av1
playback.video.first_frame
playback.video.looping
playback.video.hardware_decode
playback.video.muted_autoplay
```

Recommended tests:

- Play H.264 MP4
- Play H.265 MP4
- Play unsupported codec
- Loop video
- Switch image to video
- Switch video to image
- Switch video to video
- Confirm fallback after decoder failure
- Confirm first-frame guard works
- Confirm black-frame-safe transition works

## Black-gap handling

TomorrowOS should test webOS for black gaps during content transitions.

Transition pairs to test:

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

webOS-specific risks may include:

- Video first-frame delay
- Browser or app reload behaviour
- Media decoder reset
- Web app memory pressure
- Widget load delay
- Unsupported codec causing blank playback
- Playlist activation before assets are ready

Recommended behaviour:

- Keep previous content visible
- Preload next content
- Confirm first video frame
- Confirm widget entrypoint
- Use timeout
- Fall back if content fails
- Restore last known good content

Example:

```ts
await tomorrow.transitions.execute({
  mode: "black-frame-safe",
  preload: true,
  requireFirstFrame: true,
  fallback: "/assets/fallback.jpg",
  timeoutMs: 3000
})
```

## Widget and HTML support

webOS widget support should be tested carefully.

Track support for:

- Local HTML
- Local CSS
- Local JavaScript
- Fonts
- External API calls
- Local JSON files
- Local images
- Local videos
- WebSocket connections
- Timers
- Animation performance
- Runtime errors
- Memory limits
- Offline behaviour

Capability examples:

```txt
playback.widget
playback.widget.entrypoint
playback.widget.local_assets
playback.widget.external_network
playback.widget.timeout
playback.widget.runtime_errors
playback.widget.fallback
```

Recommended tests:

- Load simple widget
- Load widget with local assets
- Load widget with external API call
- Load widget offline
- Missing entrypoint
- JavaScript error
- Widget timeout
- Widget fallback
- Widget to image transition
- Widget to video transition

## ZIP and package handling

webOS package support may depend heavily on the runtime and deployment method.

TomorrowOS should not assume ZIP handling is supported in a normal browser runtime.

Capability examples:

```txt
package.zip
package.manifest
package.safe_extraction
package.entrypoint
package.rollback
package.remove
```

Likely support status before testing:

```txt
requires-bridge
```

or:

```txt
unknown
```

Package handling should test:

- Valid ZIP package
- Invalid ZIP package
- Missing manifest
- Invalid manifest
- Missing entrypoint
- Unsafe path traversal
- Unsupported file type
- Oversized package
- Package rollback
- Package removal

## Asset storage and cache

webOS storage behaviour should be tested by model, firmware and app runtime.

Track support for:

- Asset download
- Local storage
- Cache size
- Cache cleanup
- Checksum validation
- Partial download detection
- Asset expiry
- Offline playback
- Last known good content
- Atomic activation

Capability examples:

```txt
asset.download
asset.checksum
asset.stage
asset.atomic_activation
asset.cleanup
asset.expiry
asset.storage.available
asset.storage.pressure
asset.partial_download_detection
network.offline_cache
```

Recommended tests:

- Download image
- Download video
- Interrupt download
- Detect partial file
- Validate checksum
- Fill storage
- Cleanup expired asset
- Continue playback offline
- Activate playlist atomically
- Roll back failed activation

## Display control

webOS display control may depend on model, firmware, permissions and signage API access.

Track support for:

- Power on
- Power off
- Reboot
- Restart app
- Brightness
- Volume
- Mute
- Input source
- Orientation
- Screen resolution
- Panel status
- Temperature, where available
- Usage hours, where available

Capability examples:

```txt
display.power
display.reboot
display.restart_app
display.brightness
display.volume
display.mute
display.input
display.orientation
display.panel_status
display.temperature
display.usage_hours
```

Support should usually be marked as:

```txt
model-dependent
firmware-dependent
requires-bridge
```

unless tested and confirmed.

## Network

webOS network support should track:

- Online status
- Offline status
- IP address
- MAC address, where available
- DNS test
- URL reachability
- Captive portal detection
- Reconnect detection
- Network jitter
- Offline playback behaviour

Capability examples:

```txt
network.status
network.ip_address
network.mac_address
network.dns_test
network.url_test
network.captive_portal
network.reconnect
network.offline_cache
```

Recommended tests:

- Start online
- Drop network
- Continue cached playback
- Reconnect
- Retry failed download
- Report offline event
- Report reconnect event

## Telemetry

webOS telemetry should report what is happening on the device and runtime.

Track support for:

- Heartbeat
- Current content
- Current playlist
- App version
- Runtime version
- Online/offline state
- Playback errors
- Package errors
- Asset errors
- Storage pressure
- Memory pressure
- Crash logs
- Screenshots, where supported
- Last successful proof-of-play

Capability examples:

```txt
telemetry.heartbeat
telemetry.current_content
telemetry.current_playlist
telemetry.app_version
telemetry.runtime_version
telemetry.playback_errors
telemetry.package_errors
telemetry.asset_errors
telemetry.storage_pressure
telemetry.memory_pressure
telemetry.screenshot
telemetry.logs
```

## Screenshots

Screenshot support should be treated carefully.

It may be:

```txt
supported
unsupported
model-dependent
firmware-dependent
requires-bridge
unsafe
unknown
```

depending on the webOS model and runtime.

Screenshot capability examples:

```txt
telemetry.screenshot
proof.screenshot
proof.display
```

Security considerations:

- Screenshots may contain customer data
- Screenshots may contain pricing
- Screenshots may contain internal content
- Screenshots may reveal environment details
- Screenshots should not be captured or transmitted without permission

## Proof-of-play and proof-of-display

TomorrowOS should separate proof-of-play from proof-of-display.

Capability examples:

```txt
proof.play
proof.display
proof.screenshot
proof.failure
proof.audit_export
```

Proof-of-play means the player attempted to play the content.

Proof-of-display means there is evidence the content was actually visible on screen.

On webOS, proof-of-display may require screenshot support, display feedback or another verification method.

Recommended proof event:

```json
{
  "type": "proof.play",
  "contentId": "promo_video_001",
  "playlistId": "lunch_menu",
  "os": "webos",
  "model": "example-model",
  "firmware": "example-firmware",
  "startedAt": "2026-01-01T10:00:00.000Z",
  "durationMs": 15000
}
```

## Synchronisation

webOS synchronisation should be tested carefully.

Track support for:

- Sync group
- Master/follower
- Start at timestamp
- Drift measurement
- Drift correction
- Video wall mapping
- Bezel compensation
- Approximate sync
- Frame-accurate sync, if available
- Recovery after screen drop-off

Capability examples:

```txt
sync.group
sync.master
sync.follower
sync.start_at
sync.drift
sync.drift_correction
sync.wall
sync.panel_mapping
sync.bezel_compensation
```

Recommended tests:

- Two-screen start
- Multi-screen start
- Start at timestamp
- Network jitter
- One screen drop-off
- Rejoin group
- Drift measurement
- Video wall playback

## Security considerations

webOS support should follow TomorrowOS security principles.

Security-sensitive areas include:

- Local APIs
- Remote commands
- Device control
- Package handling
- Asset downloads
- Screenshots
- Logs
- Credentials
- Access tokens
- Customer data
- Proof data

Do not expose unsafe or unauthenticated device-control functions.

Do not log secrets or credentials.

Do not mark unsupported or unsafe features as supported.

## Certification tests

Minimum webOS certification tests should include:

- Device info
- Firmware info
- JPG playback
- PNG playback
- MP4 H.264 playback
- Unsupported video fallback
- Image to image transition
- Image to video transition
- Video to image transition
- Video to video transition
- Widget load
- Widget timeout fallback
- ZIP package validation, if supported
- Asset download
- Checksum validation
- Partial download rejection
- Atomic playlist activation
- Offline cached playback
- Last known good recovery
- Heartbeat telemetry
- Playback error telemetry
- Proof-of-play event
- Screenshot test, if supported
- Display power test, if supported
- Brightness test, if supported
- Sync test, if supported
- Security boundary review

## Example capability record

```json
{
  "feature": "playback.video.h264",
  "os": "webos",
  "status": "firmware-dependent",
  "testedModels": ["example-model"],
  "testedFirmware": ["example-firmware"],
  "runtime": "browser",
  "source": "tested",
  "notes": "Works in tested conditions. Playback should still be validated per model, firmware and content profile.",
  "fallback": "Use fallback image if video preflight fails."
}
```

## Known gaps to investigate

webOS support should continue investigating:

- Browser engine differences by webOS version
- Video codec support by model
- H.265 support by model
- Large file playback limits
- Storage limits
- Screenshot availability
- Power control availability
- App restart behaviour
- ZIP extraction feasibility
- Local package mounting
- Native bridge requirements
- Sync accuracy
- Offline package behaviour
- Firmware update impact
- Signage API access differences by deployment method

## Goal

The goal is for TomorrowOS to support LG webOS in a way that is practical, honest and useful for real signage deployments.

webOS should be treated as a first-class platform, but support must be proven by model, firmware and runtime.

One API.

Honest capability mapping.

Safe fallback behaviour.
