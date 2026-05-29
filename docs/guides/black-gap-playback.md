# Black Gap and Playback Failure Handling

Black gaps are one of the most common and frustrating issues in digital signage.

A black gap happens when the screen briefly or permanently shows black, blank, frozen or broken content during playback or content changeover.

TomorrowOS treats black gaps as a first-class failure mode, not just a visual glitch.

## Why black gaps happen

Black gaps can happen when:

- The next image is not loaded yet
- The next video has not decoded its first frame
- A video codec is unsupported
- A widget takes too long to load
- A ZIP package is missing its entrypoint
- A playlist changes before new content is ready
- The browser engine reloads
- The device runs out of memory
- The screen loses network access
- A content download is incomplete
- A CMS player crashes
- A transition is triggered too early
- A video wall screen drops out of sync
- A platform handles media differently than expected

TomorrowOS should aim to prevent these issues wherever possible.

## Core principle

The core principle is simple:

> Never remove good content from screen until the next content is ready.

This means TomorrowOS should avoid switching to the next item until it has been validated, loaded, decoded or staged safely.

## Transition types

TomorrowOS should track and test every major transition pair.

| Transition | Risk |
| --- | --- |
| Image to image | Low risk, but still needs preload |
| Image to video | First-frame and codec risk |
| Video to image | Timing and decoder release risk |
| Video to video | High risk, decoder and first-frame issues |
| Image to widget | Widget load and entrypoint risk |
| Widget to image | Runtime cleanup risk |
| Video to widget | Decoder release and widget load risk |
| Widget to video | Widget cleanup and first-frame risk |
| Playlist to playlist | Atomic activation risk |
| Zone to zone | Partial layout or timing risk |

## Black-frame-safe transition

A black-frame-safe transition should:

1. Keep the current content visible
2. Preload the next item
3. Validate the next item can render
4. Confirm the first frame if the next item is video
5. Confirm the entrypoint if the next item is a widget
6. Switch only when the next item is ready
7. Fall back if the next item fails
8. Log the failure
9. Continue playback using last known good content where possible

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

## Playback preflight

Before content is played, TomorrowOS should run preflight checks.

Preflight may include:

- File exists
- File is fully downloaded
- File checksum matches
- File type is allowed
- Codec is supported
- Image dimensions are safe
- Video resolution is safe
- Duration is known
- Widget entrypoint exists
- Package manifest is valid
- Required permissions are available
- Fallback content exists
- Storage is available
- Runtime capability is supported

Example:

```ts
const result = await tomorrow.preflight.validate({
  type: "video",
  src: "/assets/promo.mp4",
  fallback: "/assets/fallback.jpg"
})

if (result.ok) {
  await tomorrow.playback.play({
    type: "video",
    src: "/assets/promo.mp4",
    transition: "black-frame-safe"
  })
} else {
  await tomorrow.playback.play({
    type: "image",
    src: "/assets/fallback.jpg"
  })
}
```

## Image playback handling

Image playback should account for:

- Format support
- File size
- Pixel dimensions
- Aspect ratio
- Rotation
- Scaling mode
- Transparency
- Memory pressure
- Preload behaviour
- Corrupt image files
- Fallback image availability

Example capability checks:

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

## Video playback handling

Video playback is one of the highest-risk areas.

TomorrowOS should account for:

- Codec support
- Container support
- Resolution
- Bitrate
- Frame rate
- Duration
- Audio
- Muted autoplay
- Hardware decoding
- Software decoding
- First-frame readiness
- Looping behaviour
- Decoder failure
- Memory pressure
- Black frame at start
- Black frame at end
- Corrupt video files

Example capability checks:

```txt
playback.video.mp4
playback.video.h264
playback.video.h265
playback.video.vp9
playback.video.av1
playback.video.webm
playback.video.first_frame
playback.video.looping
playback.video.hardware_decode
playback.video.muted_autoplay
```

## Widget playback handling

Widgets are risky because they may rely on HTML, CSS, JavaScript, fonts, network calls or package files.

TomorrowOS should account for:

- Entrypoint exists
- JavaScript support
- CSS support
- Font loading
- External network calls
- Local asset references
- Timeout handling
- Runtime errors
- Memory pressure
- Widget crash detection
- Widget fallback content
- Reload behaviour
- Security restrictions

Example capability checks:

```txt
playback.widget
playback.widget.entrypoint
playback.widget.timeout
playback.widget.local_assets
playback.widget.external_network
playback.widget.runtime_errors
playback.widget.fallback
```

## Playlist playback handling

Playlist changes can create black gaps if new content is activated too early.

TomorrowOS should support:

- Playlist validation
- Asset staging
- Schedule validation
- Zone validation
- Fallback rules
- Atomic playlist activation
- Last known good playlist
- Rollback on failed activation
- Proof-of-play continuity
- Offline playlist behaviour

Example:

```ts
await tomorrow.playback.setPlaylist(playlist, {
  activation: "atomic",
  fallback: "last-known-good",
  validateBeforeActivation: true
})
```

## Atomic activation

Atomic activation means content should only switch once all required files and rules are ready.

A playlist should not become active if:

- Some assets are missing
- Some downloads are incomplete
- Checksums fail
- A required widget package fails validation
- A fallback is missing
- The device lacks required capabilities
- Storage is too low
- The schedule is invalid

Example:

```ts
await tomorrow.assets.stage(playlist.assets)

const validation = await tomorrow.playback.validatePlaylist(playlist)

if (validation.ok) {
  await tomorrow.playback.activatePlaylist(playlist.id, {
    mode: "atomic"
  })
} else {
  await tomorrow.playback.restoreLastKnownGood()
}
```

## Last known good content

Every signage device should have safe content it can return to.

TomorrowOS should support:

- Last known good image
- Last known good playlist
- Last known good widget package
- Default fallback image
- Emergency fallback
- Offline fallback
- Failed update rollback

Example:

```ts
await tomorrow.playback.restoreLastKnownGood()
```

## Failure events

When playback fails, TomorrowOS should log structured events.

Example:

```json
{
  "type": "playback.failure",
  "contentId": "promo_video",
  "reason": "first_frame_timeout",
  "os": "tizen",
  "model": "QM43C",
  "firmware": "7.0",
  "fallbackUsed": true,
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

## Failure reasons

Common failure reasons may include:

```txt
asset_missing
asset_checksum_failed
asset_partial_download
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
unknown_runtime_error
```

## Proof and black gaps

Proof-of-play should not simply mean the player attempted to play content.

TomorrowOS should separate:

| Type | Meaning |
| --- | --- |
| Proof-of-play | The player attempted to play the item |
| Proof-of-display | There is evidence the item actually appeared |
| Proof-of-failure | The item failed and fallback was used |
| Screenshot proof | Visual evidence where supported |
| Event proof | Timestamped playback and failure records |

This is important because a CMS may report that content played even if the screen was black.

## Certification tests

Every supported OS, model and firmware combination should be tested for black-gap handling.

Minimum tests:

- Image to image
- Image to video
- Video to image
- Video to video
- Image to widget
- Widget to image
- Playlist to playlist
- Failed video codec fallback
- Missing image fallback
- Widget timeout fallback
- Partial asset download rejection
- Failed ZIP package rollback
- Offline playback continuation
- Last known good recovery
- Screenshot or proof event after playback

## API design goals

The black-gap and playback handling APIs should be:

- Safe by default
- Easy to use
- Capability-aware
- Honest about unsupported features
- Designed for real signage deployments
- Built around fallback and recovery
- Clear in telemetry and proof events
- Consistent across operating systems

## Goal

TomorrowOS should make black gaps harder to create and easier to diagnose.

The goal is not just to play content.

The goal is to keep the screen showing the right content, at the right time, with clear recovery when something goes wrong.
