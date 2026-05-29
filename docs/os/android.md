# Android

This page documents TomorrowOS support considerations for Android-based digital signage players, displays and commercial devices.

Android is widely used in digital signage because it can run on media players, system-on-chip displays, tablets, kiosks, custom hardware and commercial signage devices. TomorrowOS should treat Android as an important platform, but support must be mapped carefully because Android signage environments vary heavily by device manufacturer, Android version, firmware, launcher, permissions and whether the device is running a managed player app or web runtime.

## Purpose

The purpose of this page is to track how TomorrowOS should approach Android support across:

- Device identification
- Runtime capability
- WebView and browser behaviour
- Native app behaviour
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

Android support should never be assumed universally.

A feature may depend on:

- Device manufacturer
- Device model
- Android version
- Firmware version
- WebView version
- Hardware decoder support
- App permissions
- Device owner mode
- Kiosk mode
- MDM control
- Root access, if present
- Storage permissions
- Battery optimisation settings
- Whether the app is native, WebView-based or browser-based
- Whether the device is a media player, SoC display, tablet or custom hardware
- Whether a native bridge or agent is available

Every Android feature should be validated through the Capability API before use.

Example:

```ts
const support = await tomorrow.capabilities.check("playback.video.h264")

if (support.status === "supported") {
  await tomorrow.playback.play({
    type: "video",
    src: "/assets/promo.mp4",
    fallback: "/assets/fallback.jpg"
  })
}
```

## Recommended support status approach

Android features should usually start as:

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

Do not mark an Android capability as `supported` unless it has been tested on a real device model and firmware version.

## Device identification

TomorrowOS should attempt to identify:

- Manufacturer
- Device model
- Android version
- Firmware version
- Build number
- Serial number, where available
- Display orientation
- Screen resolution
- Runtime type
- App version
- Storage availability
- Network state
- WebView version, if relevant

Example capability names:

```txt
device.info
device.model
device.firmware
device.os_version
device.build_number
device.serial
device.orientation
device.resolution
device.storage
device.webview_version
```

Example API:

```ts
const device = await tomorrow.device.info()
```

Example response:

```json
{
  "manufacturer": "example-manufacturer",
  "os": "android",
  "osVersion": "13",
  "model": "example-model",
  "firmware": "example-firmware",
  "buildNumber": "example-build",
  "orientation": "landscape",
  "runtime": "native-app",
  "webViewVersion": "example-webview-version"
}
```

## Runtime considerations

Android signage apps may run in several ways.

Possible runtime types:

- Native Android app
- WebView-based app
- Browser-based player
- Kiosk app
- CMS player app
- Device owner app
- MDM-managed app
- Native bridge-assisted runtime

TomorrowOS should document which runtime is being tested.

Capability support may change depending on runtime.

Example:

```json
{
  "feature": "display.power",
  "os": "android",
  "status": "requires-bridge",
  "runtime": "webview",
  "notes": "Power control is not available from a normal WebView runtime and may require native app permissions, device owner mode or OEM APIs."
}
```

## WebView and browser behaviour

Android WebView support can vary by OS version, WebView version, device manufacturer and app implementation.

TomorrowOS should track:

- JavaScript support
- CSS support
- HTML5 video support
- Web storage support
- Canvas support
- WebGL support
- WebSocket support
- Fetch/XHR support
- Service worker support
- Autoplay behaviour
- Media decoder behaviour
- Fullscreen behaviour
- Memory limits
- WebView crash behaviour

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
runtime.webview_version
```

## Image playback

Android image support should be tested by device, runtime and firmware.

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
- Load WebP
- Load large image
- Load unsupported image type
- Switch image to image
- Switch image to video
- Confirm fallback image works

## Video playback

Video playback on Android can vary heavily by chipset, decoder support and app/runtime.

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
- Software decoding
- Decoder failure
- Audio behaviour
- Black frame at start
- Black frame at end
- DRM restrictions, where relevant

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
playback.video.software_decode
playback.video.muted_autoplay
```

Recommended tests:

- Play H.264 MP4
- Play H.265 MP4
- Play unsupported codec
- Play high-bitrate video
- Loop video
- Switch image to video
- Switch video to image
- Switch video to video
- Confirm fallback after decoder failure
- Confirm first-frame guard works
- Confirm black-frame-safe transition works

## Black-gap handling

TomorrowOS should test Android for black gaps during content transitions.

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

Android-specific risks may include:

- WebView reload behaviour
- Hardware decoder delay
- First-frame delay
- SurfaceView or TextureView switching
- App lifecycle interruptions
- Memory pressure
- Battery optimisation killing background tasks
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

Android widget support may be strong when using WebView or browser-based runtimes, but still needs testing.

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
- WebView-specific limitations

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

Android package support depends on app permissions, file access, storage model and whether TomorrowOS is running inside a native app or WebView.

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
- Scoped storage restrictions
- External storage restrictions

## Asset storage and cache

Android storage behaviour should be tested by device, Android version, app permissions and runtime.

Track support for:

- Asset download
- Local storage
- App-specific storage
- External storage, where allowed
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

Android display control varies heavily.

Some controls may require:

- Native app permissions
- Device owner mode
- OEM APIs
- MDM integration
- Root access
- System app access
- External display control
- HDMI-CEC, where supported

Track support for:

- Power on
- Power off
- Reboot
- Restart app
- Brightness
- Volume
- Mute
- Orientation
- Screen resolution
- Wake lock
- Kiosk mode
- App pinning
- System status
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
display.orientation
display.resolution
display.wake_lock
display.kiosk_mode
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

Android network support should track:

- Online status
- Offline status
- IP address
- MAC address, where available
- DNS test
- URL reachability
- Captive portal detection
- Reconnect detection
- Network jitter
- Wi-Fi state
- Ethernet state
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
network.wifi_state
network.ethernet_state
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

Android telemetry should report what is happening on the device and runtime.

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
- App lifecycle events
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
telemetry.app_lifecycle
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

depending on runtime, app permissions and Android version.

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

On Android, proof-of-display may require screenshot support, rendering feedback, native app state or another verification method.

Recommended proof event:

```json
{
  "type": "proof.play",
  "contentId": "promo_video_001",
  "playlistId": "lunch_menu",
  "os": "android",
  "model": "example-model",
  "firmware": "example-firmware",
  "startedAt": "2026-01-01T10:00:00.000Z",
  "durationMs": 15000
}
```

## Synchronisation

Android synchronisation should be tested carefully because timing can vary heavily across hardware.

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
- Recovery after device drop-off

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

- Two-device start
- Multi-device start
- Start at timestamp
- Network jitter
- One device drop-off
- Rejoin group
- Drift measurement
- Video wall playback
- Long-running sync test

## Security considerations

Android support should follow TomorrowOS security principles.

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
- App permissions
- Device owner mode
- MDM access

Do not expose unsafe or unauthenticated device-control functions.

Do not log secrets or credentials.

Do not mark unsupported or unsafe features as supported.

## Certification tests

Minimum Android certification tests should include:

- Device info
- Android version
- Firmware or build number
- WebView version, if relevant
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
- Kiosk/wake lock test, if supported
- Sync test, if supported
- Security boundary review

## Example capability record

```json
{
  "feature": "playback.video.h264",
  "os": "android",
  "status": "model-dependent",
  "testedModels": ["example-model"],
  "testedFirmware": ["example-firmware"],
  "runtime": "native-app",
  "source": "tested",
  "notes": "Works in tested conditions. Playback should still be validated per chipset, Android version, firmware and content profile.",
  "fallback": "Use fallback image if video preflight fails."
}
```

## Known gaps to investigate

Android support should continue investigating:

- WebView differences by Android version
- Hardware decoder support by chipset
- H.265 support by model
- AV1 support by model
- Large file playback limits
- Storage restrictions
- Scoped storage behaviour
- Screenshot availability
- Power control availability
- App restart behaviour
- ZIP extraction feasibility
- Local package mounting
- Native bridge requirements
- Device owner requirements
- Kiosk mode behaviour
- Battery optimisation impact
- Sync accuracy
- Offline package behaviour
- Firmware update impact

## Goal

The goal is for TomorrowOS to support Android in a way that is practical, honest and useful for real signage deployments.

Android should be treated as a first-class platform, but support must be proven by device model, Android version, firmware, runtime and permissions.

One API.

Honest capability mapping.

Safe fallback behaviour.
