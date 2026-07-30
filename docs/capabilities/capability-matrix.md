# Capability Matrix

The TomorrowOS Capability Matrix is the truth layer for the project.

It tracks what each operating system, device model, firmware version and runtime can safely support.

TomorrowOS should never assume that every screen, media player or signage operating system can do the same thing. The matrix exists so developers can check support before using a feature.

## Why the capability matrix matters

Digital signage platforms behave differently across:

- Samsung Tizen
- BrightSign OS
- LG webOS
- Android
- Windows


Even within the same operating system, support can vary by:

- Device model
- Firmware version
- Browser engine
- Media engine
- Storage limits
- Native API access
- App permissions
- Commercial display generation
- Whether a native bridge or agent is available

The capability matrix keeps TomorrowOS honest, practical and useful in real deployments.

## Capability-first principle

Before using a feature, developers should check whether the device can safely support it.

Example:

```ts
const support = await tomorrow.capabilities.check("playback.video.h264")

if (support.status === "supported") {
  await tomorrow.playback.play({
    type: "video",
    src: "/assets/promo.mp4"
  })
} else {
  await tomorrow.playback.play({
    type: "image",
    src: "/assets/fallback.jpg"
  })
}
```

## Support statuses

Each feature should use one of the following statuses.

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

## Capability record format

Every capability record should include enough information to explain what is supported and why.

Example:

```json
{
  "feature": "playback.video.h264",
  "os": "tizen",
  "status": "firmware-dependent",
  "testedModels": ["QM43C"],
  "testedFirmware": ["Tizen 7.0"],
  "runtime": "browser",
  "source": "tested",
  "notes": "Works in tested conditions. Codec and playback behaviour should still be validated per model and firmware.",
  "fallback": "Use fallback image if video preflight fails."
}
```

## Capability categories

The matrix should cover every major area that matters in a real signage deployment.

### Device

- Device identity
- Manufacturer
- Model
- Serial number, where available
- Firmware version
- OS version
- Runtime type
- Screen orientation
- Display resolution
- Storage availability
- Memory availability

### Playback

- Image playback
- Video playback
- HTML playback
- Widget playback
- Playlist playback
- Multi-zone playback
- Scheduled playback
- Looping
- Pause
- Resume
- Stop
- Restore last known good content

### Image support

- JPG
- PNG
- WebP
- SVG
- GIF
- Transparency
- Large image handling
- Scaling behaviour
- Aspect ratio handling
- Rotation behaviour
- Memory limits

### Video support

- MP4
- H.264
- H.265
- VP9
- AV1
- MOV
- WebM
- Hardware decoding
- Software decoding
- First-frame readiness
- Looping behaviour
- Audio support
- Muted autoplay
- Video duration handling
- Large file handling
- Decoder failure behaviour

### Transition support

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
- Preloading
- Crossfade
- Hard cut
- Black-frame-safe transition
- First-frame guard
- Rollback on failed transition

### Black gap handling

- Detect black screen risk
- Keep previous content on screen
- Preload next item
- Confirm first video frame
- Confirm widget entrypoint loaded
- Timeout if next content fails
- Use fallback content
- Roll back to last known good content
- Log black gap events

### Package and widget support

- ZIP package validation
- Manifest validation
- Entrypoint detection
- Safe extraction
- Path traversal protection
- File type validation
- Package size limits
- Local package mounting
- Widget timeout handling
- Widget crash detection
- Widget fallback content
- Package rollback
- Package removal

### Asset handling

- Asset download
- Asset checksum
- Partial download detection
- Local cache
- Cache cleanup
- Asset expiry
- Storage pressure detection
- Atomic activation
- Download retry
- Fallback on failed download
- Last known good asset recovery

### Display control

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

### Network

- Online status
- Offline status
- IP address
- MAC address
- DNS test
- URL reachability test
- Captive portal detection
- Reconnect detection
- Network jitter
- Bandwidth estimate
- Offline content behaviour

### Synchronisation

- Sync group creation
- Join sync group
- Leave sync group
- Master/follower mode
- Start at timestamp
- Drift measurement
- Drift correction
- Video wall support
- Panel mapping
- Bezel compensation
- Network jitter tolerance
- Recovery after screen drop-off
- Approximate sync
- Frame-accurate sync, where available

### Telemetry

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
- Last successful sync
- Last successful proof-of-play

### Proof

- Proof-of-play
- Proof-of-display
- Screenshot proof
- Timestamped event proof
- Playlist proof
- Zone proof
- Duration proof
- Failed playback proof
- Exportable audit records

### Security

- Local API authentication
- Permission checks
- Safe command validation
- Trusted package validation
- Token handling
- Credential handling
- Secret redaction from logs
- No unauthenticated destructive commands
- No unsafe package extraction
- No unnecessary customer data exposure

## Example feature naming

Feature names should be predictable and easy to search.

Examples:

```txt
device.info
device.firmware
playback.image.jpg
playback.image.png
playback.video.h264
playback.video.h265
playback.html
playback.widget
transition.image_to_image
transition.image_to_video
transition.video_to_image
transition.video_to_video
package.zip
package.manifest
package.rollback
asset.download
asset.checksum
asset.atomic_activation
display.power
display.brightness
display.orientation
network.status
sync.group
sync.wall
sync.drift
telemetry.heartbeat
telemetry.screenshot
proof.play
proof.display
security.local_api_auth
```

## OS support table example

| Feature | Tizen | webOS | BrightSign OS | Android | Browser |
| --- | --- | --- | --- | --- | --- |
| `playback.image.jpg` | supported | supported | supported | supported | supported |
| `playback.video.h264` | firmware-dependent | model-dependent | supported | model-dependent | browser-dependent |
| `package.zip` | requires-bridge | requires-bridge | requires-bridge | partial | partial |
| `display.power` | model-dependent | model-dependent | requires-bridge | model-dependent | unsupported |
| `telemetry.screenshot` | model-dependent | model-dependent | requires-bridge | partial | browser-dependent |
| `sync.wall` | partial | partial | supported | partial | unsupported |

## Evidence requirements

A capability claim should ideally include:

- Operating system
- Device model
- Firmware version
- Runtime or browser engine
- Test method
- Result
- Known limitations
- Required bridge or permissions
- Fallback behaviour
- Date tested

## What not to do

Do not mark a feature as supported just because:

- The OS documentation says it might be possible
- A similar model supports it
- A newer firmware may support it
- A browser theoretically supports it
- A native API exists but is not accessible from the runtime
- A workaround exists but is unsafe or unreliable

If support is uncertain, mark it as `unknown`, `partial`, `model-dependent`, `firmware-dependent` or `requires-bridge`.

## Goal

The capability matrix should become the most trusted reference for what signage operating systems can actually do in the field.

The value of TomorrowOS is not pretending every platform is the same.

The value is giving developers one API while being honest about what each platform can safely support.
