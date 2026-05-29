# Certification Testing

TomorrowOS should not mark a feature as supported unless it has been tested, evidenced or clearly documented.

Certification testing is how TomorrowOS proves that a feature works on a specific operating system, device model, firmware version and runtime.

## Purpose

The purpose of certification testing is to make TomorrowOS capability claims trustworthy.

Digital signage operating systems vary heavily across:

- Operating system
- Device model
- Firmware version
- Browser engine
- Media engine
- Runtime
- App permissions
- Native API access
- Storage behaviour
- Network conditions
- Whether a bridge or agent is available

A feature should not be marked as `supported` just because it works somewhere.

It should be tested and documented.

## Core principle

The core principle is:

> No evidence, no supported claim.

If a feature has not been tested, it should be marked as:

```txt
unknown
```

If it only works in some conditions, it should be marked as:

```txt
partial
model-dependent
firmware-dependent
requires-bridge
unsafe
```

## Certification status

Certification results should use clear status values.

| Status | Meaning |
| --- | --- |
| `passed` | Test passed in the documented environment |
| `failed` | Test failed in the documented environment |
| `partial` | Test passed with limitations |
| `blocked` | Test could not be completed |
| `not-applicable` | Test does not apply to this platform |
| `requires-bridge` | Test requires a bridge, agent or native layer |
| `unsafe` | Test is possible but not recommended |
| `unknown` | Test has not been run |

## Capability support status

Certification results help determine capability support.

| Capability status | Meaning |
| --- | --- |
| `supported` | Works through the standard TomorrowOS API |
| `unsupported` | Not available on this OS/device |
| `partial` | Works, but with known limits |
| `model-dependent` | Depends on the exact hardware model |
| `firmware-dependent` | Depends on firmware or OS version |
| `requires-bridge` | Requires an agent, native bridge or platform-specific layer |
| `unsafe` | Possible, but not recommended |
| `unknown` | Not yet tested |

## Certification record

Each certification record should include:

- Operating system
- Device manufacturer
- Device model
- Firmware version
- OS version
- Runtime type
- Browser engine or WebView version, where relevant
- TomorrowOS version
- Connector or bridge used
- Test date
- Tester
- Test result
- Known limitations
- Fallback behaviour
- Evidence or notes

Example:

```json
{
  "os": "tizen",
  "manufacturer": "Samsung",
  "model": "QM43C",
  "firmware": "Tizen 7.0",
  "runtime": "browser",
  "tomorrowosVersion": "0.1.0",
  "connector": "tizen-web",
  "testedAt": "2026-01-01T10:00:00.000Z",
  "testedBy": "example-tester",
  "result": "partial",
  "passed": 42,
  "failed": 6,
  "blocked": 2,
  "notes": "Video playback passed for tested H.264 profile. H.265 requires further model-specific testing."
}
```

## Minimum certification areas

Every supported OS, model and firmware combination should be tested across the following areas.

| Area | Purpose |
| --- | --- |
| Device | Confirm device identity and environment |
| Runtime | Confirm browser, WebView, app or bridge behaviour |
| Image playback | Confirm supported image formats |
| Video playback | Confirm supported video formats and codecs |
| Transitions | Confirm black-gap-safe switching |
| Widgets | Confirm HTML/widget runtime behaviour |
| Packages | Confirm ZIP/package validation and rollback |
| Assets | Confirm download, checksum, cache and activation |
| Display control | Confirm screen/device control where supported |
| Network | Confirm online, offline and reconnect behaviour |
| Sync | Confirm multi-screen and video wall timing |
| Telemetry | Confirm heartbeat, logs, errors and screenshots |
| Proof | Confirm proof-of-play and proof-of-display events |
| Security | Confirm safe command and package boundaries |

## Device tests

Device tests should confirm that TomorrowOS can identify the environment.

Minimum tests:

- Read manufacturer
- Read model
- Read OS
- Read OS version
- Read firmware version
- Read runtime type
- Read orientation
- Read resolution
- Read storage availability
- Read network state

Capability examples:

```txt
device.info
device.model
device.firmware
device.os_version
device.orientation
device.resolution
device.storage
network.status
```

## Runtime tests

Runtime tests should confirm the app environment.

Minimum tests:

- JavaScript support
- CSS support
- HTML5 video support
- Canvas support
- WebSocket support
- Fetch/XHR support
- Local storage support
- Runtime memory behaviour
- Runtime crash handling
- Bridge availability, if relevant

Capability examples:

```txt
runtime.javascript
runtime.css
runtime.html5_video
runtime.canvas
runtime.websocket
runtime.fetch
runtime.local_storage
runtime.memory_limit
runtime.bridge
```

## Image playback tests

Minimum tests:

- JPG playback
- PNG playback
- Transparent PNG playback
- WebP playback, where relevant
- SVG playback, where relevant
- Large image playback
- Unsupported image fallback
- Image scaling
- Image rotation
- Image-to-image transition

Capability examples:

```txt
playback.image.jpg
playback.image.png
playback.image.webp
playback.image.svg
playback.image.transparency
playback.image.large_file
playback.image.scaling
transition.image_to_image
```

## Video playback tests

Minimum tests:

- MP4 playback
- H.264 playback
- H.265 playback, where relevant
- WebM playback, where relevant
- Unsupported codec fallback
- High-resolution video playback
- High-bitrate video playback
- Muted autoplay
- Looping
- First-frame readiness
- Video-to-video transition
- Video-to-image transition
- Image-to-video transition

Capability examples:

```txt
playback.video.mp4
playback.video.h264
playback.video.h265
playback.video.webm
playback.video.first_frame
playback.video.looping
playback.video.hardware_decode
transition.image_to_video
transition.video_to_image
transition.video_to_video
```

## Black-gap transition tests

Black-gap tests should confirm that current content stays visible until the next content is ready.

Minimum tests:

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
- Failed video fallback
- Failed widget fallback
- First-frame timeout fallback
- Last known good recovery

Capability examples:

```txt
transition.image_to_image
transition.image_to_video
transition.video_to_image
transition.video_to_video
transition.image_to_widget
transition.widget_to_image
transition.black_frame_safe
playback.restore_last_known_good
```

## Widget tests

Minimum tests:

- Simple widget load
- Widget with local assets
- Widget with external network call
- Widget offline behaviour
- Missing entrypoint
- JavaScript runtime error
- Widget timeout
- Widget fallback
- Widget memory pressure
- Widget-to-media transition

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

## Package tests

Minimum tests:

- Valid ZIP package
- Invalid ZIP package
- Missing manifest
- Invalid manifest JSON
- Missing entrypoint
- Missing fallback
- Unsafe path traversal attempt
- Unsupported file type
- Oversized package
- Package staging
- Package activation
- Package rollback
- Package removal

Capability examples:

```txt
package.zip
package.manifest
package.safe_extraction
package.entrypoint
package.rollback
package.remove
security.package_validation
```

## Asset tests

Minimum tests:

- Successful image download
- Successful video download
- Failed download
- Interrupted download
- Partial download rejection
- Checksum success
- Checksum failure
- Unsupported file type
- Storage full handling
- Asset expiry
- Cache cleanup
- Offline cached playback
- Atomic playlist activation
- Activation failure rollback
- Last known good recovery
- Missing fallback handling

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

## Display control tests

Display control tests should only run where the feature is available and safe.

Minimum tests where supported:

- Power on
- Power off
- Reboot
- Restart app
- Brightness control
- Volume control
- Mute
- Orientation
- Resolution
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
display.orientation
display.panel_status
display.temperature
display.usage_hours
```

Important:

If display control requires a bridge, native app, device owner mode, serial control or OEM API, mark it clearly.

## Network tests

Minimum tests:

- Online status
- Offline status
- IP address
- DNS test
- URL reachability
- Captive portal handling, where possible
- Reconnect detection
- Offline cached playback
- Retry after reconnect
- Network failure telemetry

Capability examples:

```txt
network.status
network.ip_address
network.dns_test
network.url_test
network.captive_portal
network.reconnect
network.offline_cache
```

## Sync tests

Sync tests should be run on real multi-device or multi-screen environments where possible.

Minimum tests:

- Two-screen sync
- Multi-screen sync
- Join sync group
- Leave sync group
- Master/follower mode
- Start at timestamp
- Drift measurement
- Drift correction
- Network jitter handling
- One device drop-off
- Device rejoin
- Video wall panel mapping
- Bezel compensation, where relevant

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

## Telemetry tests

Minimum tests:

- Heartbeat
- Current content report
- Current playlist report
- App version report
- Runtime version report
- Online/offline report
- Playback error report
- Package error report
- Asset error report
- Storage pressure report
- Memory pressure report
- Screenshot, where supported
- Log export, where supported

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

## Proof tests

Proof tests should separate proof-of-play from proof-of-display.

Minimum tests:

- Proof-of-play event
- Proof-of-display event, where possible
- Screenshot proof, where supported
- Failed playback proof
- Fallback proof
- Playlist proof
- Zone proof
- Duration proof
- Audit export

Capability examples:

```txt
proof.play
proof.display
proof.screenshot
proof.failure
proof.audit_export
```

Proof-of-play means the player attempted to play content.

Proof-of-display means there is evidence the content actually appeared on screen.

## Security tests

Minimum tests:

- No unauthenticated destructive local commands
- No unsafe package extraction
- Path traversal rejected
- Secrets not logged
- Access tokens not logged
- Customer data not included in public logs
- Screenshot permissions reviewed
- Remote commands validated
- Unsupported commands fail safely
- Unknown capability does not execute as supported

Capability examples:

```txt
security.local_api_auth
security.command_validation
security.package_validation
security.secret_redaction
security.safe_defaults
```

## Certification report format

A certification report should be exportable and easy to review.

Example:

```json
{
  "certificationId": "cert_001",
  "os": "brightsign",
  "manufacturer": "BrightSign",
  "model": "HD226",
  "firmware": "example-firmware",
  "runtime": "html-widget",
  "tomorrowosVersion": "0.1.0",
  "testedAt": "2026-01-01T10:00:00.000Z",
  "summary": {
    "passed": 52,
    "failed": 4,
    "partial": 6,
    "blocked": 2
  },
  "capabilities": [
    {
      "feature": "playback.video.h264",
      "status": "supported",
      "result": "passed"
    },
    {
      "feature": "telemetry.screenshot",
      "status": "requires-bridge",
      "result": "blocked"
    }
  ],
  "notes": "Screenshot support requires further bridge testing."
}
```

## Passing criteria

A feature may be considered for `supported` status when:

- It passes the required tests
- It works through the documented API path
- It has been tested on the stated OS, model and firmware
- Known limitations are documented
- Fallback behaviour is documented
- Security risks are reviewed
- The result can be reproduced

## When to avoid supported status

Do not mark a feature as `supported` if:

- It only worked once
- The test environment is unclear
- The device model is unknown
- The firmware version is unknown
- The feature requires a bridge but the bridge is not documented
- The feature works but is unsafe
- The feature works only through a private workaround
- The feature fails under common deployment conditions
- The feature has no fallback path
- The result cannot be reproduced

Use a more accurate status instead:

```txt
partial
model-dependent
firmware-dependent
requires-bridge
unsafe
unknown
```

## Certification workflow

Recommended workflow:

1. Select OS
2. Select device model
3. Record firmware version
4. Record runtime
5. Run device tests
6. Run playback tests
7. Run package tests
8. Run asset tests
9. Run transition tests
10. Run telemetry tests
11. Run proof tests
12. Run security tests
13. Export certification report
14. Update capability matrix
15. Document known limitations

## Production readiness

Certification improves confidence, but it does not guarantee production suitability.

Production use still requires:

- Customer-specific testing
- Network testing
- Content testing
- Security review
- Rollback planning
- Monitoring
- Support planning
- Compliance review
- Acceptance testing

See:

```txt
DISCLAIMER.md
SUPPORT.md
SECURITY.md
```

## Goal

The goal of TomorrowOS certification is to make support claims trustworthy.

The project should not pretend every operating system, device or firmware version supports every feature.

The goal is to give developers one API, while making the real-world support status clear, tested and honest.
