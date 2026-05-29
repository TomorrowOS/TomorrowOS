# BrightSign OS

This page documents TomorrowOS support considerations for BrightSign OS-based digital signage media players.

BrightSign is one of the most widely used dedicated digital signage player platforms. TomorrowOS should treat BrightSign OS as a first-class signage operating system, especially for reliable playback, local storage, synchronisation, proof events and managed signage deployments.

Support should always be mapped by player model, firmware version, runtime, API access and whether a JavaScript, BrightScript or bridge-based approach is being used.

## Purpose

The purpose of this page is to track how TomorrowOS should approach BrightSign OS support across:

- Device identification
- Runtime capability
- HTML/widget support
- Image playback
- Video playback
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

BrightSign support should be treated as highly capable, but not universal.

A feature may depend on:

- BrightSign player model
- BrightSign OS version
- Firmware version
- Runtime type
- HTML widget support
- JavaScript API support
- BrightScript support
- Storage configuration
- Network configuration
- Permissions
- Whether a bridge or native layer is available
- Whether the device is being used as a standalone player, CMS player or synchronised video wall player

Every BrightSign feature should be validated through the Capability API before use.

Example:

```ts
const support = await tomorrow.capabilities.check("sync.wall")

if (support.status === "supported") {
  await tomorrow.sync.joinGroup("wall_01")
}
```

## Recommended support status approach

BrightSign features should usually start as:

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

Do not mark a BrightSign capability as `supported` unless it has been tested on a real player model and firmware version.

## Device identification

TomorrowOS should attempt to identify:

- Manufacturer
- Player model
- Firmware version
- BrightSign OS version
- Serial number, where available
- Storage device
- Network state
- Runtime type
- App or player version
- Display output resolution
- Display orientation
- Connected display state, where available

Example capability names:

```txt
device.info
device.model
device.firmware
device.os_version
device.serial
device.storage
device.network
device.runtime
device.output_resolution
```

Example API:

```ts
const device = await tomorrow.device.info()
```

Example response:

```json
{
  "manufacturer": "BrightSign",
  "os": "brightsign",
  "osVersion": "example-version",
  "model": "HD226",
  "firmware": "example-firmware",
  "runtime": "html-widget",
  "storage": "sd-card"
}
```

## Runtime considerations

BrightSign deployments may use different runtime approaches.

Possible runtime types:

- HTML widget runtime
- BrightScript runtime
- CMS player runtime
- Local presentation runtime
- JavaScript API-assisted runtime
- Bridge-assisted runtime

TomorrowOS should document which runtime is being tested.

Capability support may change significantly depending on runtime.

Example:

```json
{
  "feature": "display.reboot",
  "os": "brightsign",
  "status": "requires-bridge",
  "runtime": "html-widget",
  "notes": "May require BrightScript or native control path depending on deployment model."
}
```

## JavaScript and BrightScript considerations

BrightSign may expose functionality through different layers.

TomorrowOS should track whether a feature is available through:

- Standard browser APIs
- BrightSign JavaScript APIs
- BrightScript
- CMS-specific player APIs
- Native bridge
- Not available

Capability records should clearly state the access path.

Example:

```json
{
  "feature": "telemetry.logs",
  "os": "brightsign",
  "status": "requires-bridge",
  "accessPath": "brightscript",
  "notes": "Log access may require BrightScript integration rather than standard browser APIs."
}
```

## Browser and HTML behaviour

BrightSign HTML/widget support should be tested by model and firmware.

Track support for:

- JavaScript support
- CSS support
- HTML5 video support
- Web storage support
- Canvas support
- WebGL support
- WebSocket support
- Fetch/XHR support
- Autoplay behaviour
- Media decoder behaviour
- Memory limits
- Runtime crash behaviour

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
runtime.media_autoplay
runtime.memory_limit
```

## Image playback

BrightSign image support should be tested by model and firmware.

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

Video playback is a major BrightSign strength, but support should still be tested by model, firmware and file profile.

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
- Multi-video playback, where available

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
playback.video.multi_video
```

Recommended tests:

- Play H.264 MP4
- Play H.265 MP4, where supported
- Play unsupported codec
- Loop video
- Switch image to video
- Switch video to image
- Switch video to video
- Confirm fallback after decoder failure
- Confirm first-frame guard works
- Confirm black-frame-safe transition works
- Test large file playback
- Test long-duration video playback

## Black-gap handling

TomorrowOS should test BrightSign for black gaps during content transitions.

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

BrightSign-specific risks may include:

- Runtime handover between HTML and native playback
- Media decoder reset
- HTML widget load delay
- Storage read delay
- Unsupported file profile
- Playlist activation before assets are ready
- CMS-player-specific behaviour

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

BrightSign widget support should be tested carefully.

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

BrightSign may be well suited for local package handling, but support still depends on the chosen runtime and access path.

Capability examples:

```txt
package.zip
package.manifest
package.safe_extraction
package.entrypoint
package.rollback
package.remove
```

Potential support status before testing:

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

BrightSign deployments often rely heavily on local storage.

TomorrowOS should track support for:

- Asset download
- Local storage
- SD card storage
- Internal storage, where available
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
- Test SD card removal or failure where safe

## Display control

BrightSign display control may depend on device model, connected display, CEC support, serial control, network control or external integrations.

Track support for:

- Power on
- Power off
- Reboot
- Restart app
- Brightness, where available
- Volume
- Mute
- Input source, where available
- Orientation
- Output resolution
- Connected display status
- HDMI status
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
display.output_resolution
display.hdmi_status
display.temperature
display.usage_hours
```

Support should be marked based on tested access path.

Possible statuses:

```txt
supported
model-dependent
firmware-dependent
requires-bridge
unsupported
unknown
```

## Network

BrightSign network support should track:

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

BrightSign telemetry should report what is happening on the player and runtime.

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

depending on player model, firmware and runtime path.

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

On BrightSign, proof-of-display may require screenshot support, display feedback, output state or another verification method.

Recommended proof event:

```json
{
  "type": "proof.play",
  "contentId": "promo_video_001",
  "playlistId": "lunch_menu",
  "os": "brightsign",
  "model": "HD226",
  "firmware": "example-firmware",
  "startedAt": "2026-01-01T10:00:00.000Z",
  "durationMs": 15000
}
```

## Synchronisation

BrightSign is commonly used in synchronised signage and video wall environments, but TomorrowOS should still test support carefully.

Track support for:

- Sync group
- Master/follower
- Start at timestamp
- Drift measurement
- Drift correction
- Video wall mapping
- Bezel compensation
- Approximate sync
- Frame-accurate sync, where available
- Recovery after player drop-off

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

- Two-player start
- Multi-player start
- Start at timestamp
- Network jitter
- One player drop-off
- Rejoin group
- Drift measurement
- Video wall playback
- Long-running sync test

## Security considerations

BrightSign support should follow TomorrowOS security principles.

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

Minimum BrightSign certification tests should include:

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
- Display control test, if supported
- Sync test, if supported
- Security boundary review

## Example capability record

```json
{
  "feature": "sync.wall",
  "os": "brightsign",
  "status": "model-dependent",
  "testedModels": ["HD226"],
  "testedFirmware": ["example-firmware"],
  "runtime": "html-widget",
  "source": "tested",
  "notes": "Sync behaviour should be validated per model, firmware, content profile and network environment.",
  "fallback": "Use independent playback if sync cannot be guaranteed."
}
```

## Known gaps to investigate

BrightSign support should continue investigating:

- JavaScript API coverage by firmware
- BrightScript bridge requirements
- HTML widget limitations
- Video codec support by model
- H.265 support by model
- Large file playback limits
- SD card storage behaviour
- Screenshot availability
- Power/control path options
- ZIP extraction feasibility
- Local package mounting
- Sync accuracy
- Offline package behaviour
- Firmware update impact
- CMS-player-specific runtime differences

## Goal

The goal is for TomorrowOS to support BrightSign OS in a way that is practical, honest and useful for real signage deployments.

BrightSign should be treated as a first-class platform, but support must be proven by player model, firmware and runtime.

One API.

Honest capability mapping.

Safe fallback behaviour.
