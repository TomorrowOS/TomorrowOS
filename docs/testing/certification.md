# Certification Testing

TomorrowOS should not mark a feature as supported unless it has been tested on a real device.

Certification testing is how TomorrowOS proves that a feature works on a specific operating system, device model, firmware version and player runtime.

This page describes **how to certify against the shipped TomorrowOS surface today**: the CMS SDK, WebSocket device commands, and the Tizen / BrightSign players.

## Purpose

The purpose of certification testing is to make TomorrowOS capability claims trustworthy.

Digital signage platforms vary heavily across:

- Operating system
- Device model
- Firmware / OS version
- Media engine (AVPlay, `roVideoPlayer`, etc.)
- Player package version
- Network and storage conditions

A feature should not be marked as supported just because it works somewhere.

It should be tested and documented for the exact model + firmware.

## Core principle

> No evidence, no supported claim.

If a feature has not been tested, treat it as unknown.

If it only works in some conditions, document it as partial, model-dependent or firmware-dependent.

## Current platforms

| Platform | Certification status today |
| --- | --- |
| Samsung Tizen | Certify on **Tizen 6.5 and 7.0** |
| BrightSign | Certify on **Series 3-6** |
| LG webOS | Coming soon |
| Android | Coming soon |

See:

- `docs/os/tizen.md`
- `docs/os/brightsign.md`

## Commands to certify

Certify the **shipped device command surface**, not aspirational nested APIs.

| Command | What to prove |
| --- | --- |
| `device.info.get` | Model, firmware, identity fields return |
| `device.info.getCapabilities` | Capability map matches what actually works |
| `device.content.setPolicy` | Playlist policy applies and plays |
| `device.content.clear` | Content clears and brand idle returns |
| `device.power.reboot` | Reboot accepted and player recovers |
| `device.display.setOnOffTimer` | Timer set/clear works where supported |
| `device.telemetry.captureScreen` | Screenshot returns usable image data |

CMS helpers that should also be exercised:

```ts
tos.pairing.verify(code)
tos.playlists.savePlaylist(...)
tos.playlists.publishPlaylistsToDevice(deviceId, playlistIds)
tos.pushLatestPolicyToDevice(deviceId)
tos.setDeviceOnOffTimer(...)
tos.clearDeviceOnOffTimer(...)
```

## Certification status

| Status | Meaning |
| --- | --- |
| `passed` | Test passed in the documented environment |
| `failed` | Test failed in the documented environment |
| `partial` | Test passed with limitations |
| `blocked` | Test could not be completed |
| `not-applicable` | Test does not apply to this platform |
| `firmware-dependent` | Result depends on firmware / OS version |
| `unknown` | Test has not been run |

## Capability reporting

Players report command support through `device.info.getCapabilities` as:

```json
{
  "capabilities": {
    "device.content.setPolicy": { "supported": true },
    "device.telemetry.captureScreen": { "supported": true }
  }
}
```

Certification should check both:

1. What `getCapabilities` claims
2. What actually works on that model / firmware

A command can be advertised as supported and still fail on an old firmware build. Document that as **firmware-dependent**.

## Known hardware / firmware gates

Record these before calling a combination production-safe:

| Platform | Feature | Gate |
| --- | --- | --- |
| Samsung Tizen | `device.telemetry.captureScreen` | Firmware **1080+** |
| BrightSign Series 3 | Video playback | Firmware **9.1.140+** |
| BrightSign Series 3 | 4K H.264 video | **Hardware limit** — use 1080p even after firmware upgrade |

## Certification record

Each certification record should include:

- Operating system (`tizen` / `brightsign`)
- Device manufacturer
- Device model
- Firmware / OS version
- TomorrowOS player version
- CMS / SDK version
- CMS URL used for pairing
- Test date
- Tester
- Result summary
- Known limitations
- Evidence or notes

Example:

```json
{
  "os": "tizen",
  "manufacturer": "Samsung",
  "model": "QM43C",
  "firmware": "1080",
  "playerVersion": "1.0.0",
  "sdkVersion": "0.9.51",
  "testedAt": "2026-07-28T10:00:00.000Z",
  "testedBy": "example-tester",
  "result": "partial",
  "passed": 18,
  "failed": 1,
  "blocked": 0,
  "notes": "Screenshot passed on firmware 1080. Older firmware on the same model failed captureScreen."
}
```

## Minimum certification areas

Every supported OS, model and firmware combination should be tested across these areas.

| Area | Purpose |
| --- | --- |
| Setup | Install player, set CMS URL / orientation, pair |
| Device | Confirm identity and capabilities |
| Image playback | Confirm images play from policy |
| Video playback | Confirm codecs / resolutions for that panel |
| Transitions | Confirm black-gap-safe switching |
| Widgets | Confirm `.zip` / `.wgt` playlist items |
| Assets / offline | Confirm download, cache and offline replay |
| Display control | Confirm reboot and on/off timer where supported |
| Telemetry | Confirm screenshot where supported |
| Recovery | Confirm reconnect, reboot resume, clear → brand idle |

Areas that are **not** shipped public APIs yet (do not block V1 certification on them):

- Multi-screen video wall sync API
- Dedicated proof-of-play / proof-of-display API
- Separate `packages.validate` / install / rollback API
- Nested `tomorrow.capabilities.check(...)` client API

## Setup tests

Minimum tests:

- Player installs / boots on the target device
- Orientation can be set
- CMS URL can be set
- `localhost` / `127.0.0.1` is rejected or fails as expected for on-device players
- LAN IP or hosted CMS URL connects successfully
- Pairing code appears
- `tos.pairing.verify(code)` brings the device online

Tizen notes:

- Orientation intro + on-device CMS setup screen
- Supported baseline: **Tizen 6.5 and 7.0**

BrightSign notes:

- Configure `config.js` `cmsEndpoint` + `orientation`
- Hosted CMS BrightSign zip usually auto-fills CMS URL
- Never use `localhost` in `cmsEndpoint`; use LAN IP for local testing

## Device tests

Minimum tests:

- `device.info.get` returns model
- `device.info.get` returns firmware
- `device.info.getCapabilities` returns the expected command map
- Capability claims match later command results

## Image playback tests

Publish a policy playlist and confirm:

- JPG playback
- PNG playback
- Large image playback
- Image scaling / letterboxing acceptable for the panel
- Image → image transition without black gap

## Video playback tests

Publish a policy playlist and confirm:

- MP4 / H.264 playback
- 1080p H.264 playback
- 4K H.264 playback where the panel claims to support it
- Looping
- First-frame readiness
- Image → video
- Video → image
- Video → video

Platform-specific gates:

- **BrightSign Series 3:** require firmware **9.1.140+** for video playback; treat **4K H.264** as a **hardware limit** and certify with **1080p H.264**
- Prefer documenting exact resolution, codec profile and bitrate used in the test

## Black-gap transition tests

Confirm current content stays visible until the next item is ready.

Minimum tests:

- Image → image
- Image → video
- Video → image
- Video → video
- Single-image loop
- Single-video loop
- Multi-item playlist wrap

See `docs/guides/black-gap-playback.md` for the shipped Tizen / BrightSign behaviour.

## Widget tests

Widgets are playlist items, not a separate package API.

Minimum tests:

- `.zip` / `.wgt` package item with default `index.html`
- Package item with custom `entryFile`
- Hosted HTML widget (`type: "widget"`)
- Cache reuse after reboot for same `url` + `version`
- Missing entry file fails safely to brand idle
- Widget → media and media → widget handoff

See `docs/guides/widget-zip-packages.md`.

## Asset / offline tests

Minimum tests:

- Successful image download into local cache
- Successful video download into local cache
- Offline replay of already-cached media
- Publish blocked or fails clearly when assets are unreachable from the CMS side
- `device.content.clear` returns to brand idle
- Reconnect after network loss still accepts a later `setPolicy`

## Display control tests

Minimum tests where supported:

- `device.power.reboot`
- Resume after reboot
- `device.display.setOnOffTimer` set
- `device.display.setOnOffTimer` clear (`onOffTimer: null`)

If on/off timer capability is `supported: false`, mark the test `not-applicable`.

Do not certify brightness / volume / arbitrary power APIs that are not part of the shipped command surface.

## Telemetry tests

Minimum tests:

- Device appears online after pair
- Heartbeat / online state remains healthy during playback
- `device.telemetry.captureScreen` where supported

Tizen screenshot gate:

- Require firmware **1080+** before marking screenshot as production-supported

## Recovery tests

Minimum tests:

- Reboot while playing → resumes acceptably
- Orientation change / reload path (Tizen Red A) does not permanently brick playback
- Re-pair / reconnect pushes or restores policy as expected
- Failed playlist item falls back to brand idle instead of hanging on black

## Example certification report

```json
{
  "certificationId": "cert_bs_series3_video",
  "os": "brightsign",
  "manufacturer": "BrightSign",
  "model": "Series 3 example",
  "firmware": "9.1.140",
  "runtime": "html-widget + roVideoPlayer",
  "sdkVersion": "0.9.51",
  "testedAt": "2026-07-28T10:00:00.000Z",
  "summary": {
    "passed": 16,
    "failed": 0,
    "partial": 1,
    "blocked": 0
  },
  "commands": [
    {
      "feature": "device.content.setPolicy",
      "status": "supported",
      "result": "passed"
    },
    {
      "feature": "playback.video.h264.1080p",
      "status": "firmware-dependent",
      "result": "passed",
      "notes": "Series 3 requires firmware 9.1.140+ for reliable video playback."
    },
    {
      "feature": "playback.video.h264.4k",
      "status": "unsupported",
      "result": "failed",
      "notes": "Series 3 hardware limit. Use 1080p H.264 for this model line."
    },
    {
      "feature": "device.telemetry.captureScreen",
      "status": "supported",
      "result": "passed"
    }
  ]
}
```

## Passing criteria

A feature may be considered production-supported for a combination when:

- It passes the required tests on that OS + model + firmware
- It works through the documented command / CMS path
- Known limitations are written down
- Failure behaviour is acceptable (usually brand idle, not black hang)
- The result can be reproduced

## When to avoid a supported claim

Do not mark a feature as supported if:

- It only worked once
- Model or firmware was not recorded
- It depends on a private workaround
- It fails under common deployment conditions
- Capability says supported but real hardware fails
- Screenshot / 4K / timer was not re-checked after a firmware note

Use a more accurate label instead:

```txt
partial
model-dependent
firmware-dependent
unknown
```

## Certification workflow

Recommended workflow:

1. Select OS (`tizen` or `brightsign`)
2. Select device model
3. Record firmware / OS version
4. Record player + SDK versions
5. Complete setup + pairing
6. Run `device.info.get` + `device.info.getCapabilities`
7. Run image / video / transition tests
8. Run widget tests
9. Run offline / recovery tests
10. Run reboot + on/off timer tests
11. Run screenshot tests (respect firmware gates)
12. Export certification notes
13. Update OS docs / capability matrix with limitations

## Production readiness

Certification improves confidence, but it does not guarantee every customer deployment.

Production use still requires:

- Customer-specific content testing
- Network testing
- Security review
- Rollback / support planning
- Monitoring after go-live

See:

```txt
DISCLAIMER.md
SUPPORT.md
SECURITY.md
```

## Goal

Make TomorrowOS support claims honest.

One API surface across platforms is the goal. Certification exists to document what that API actually does on each real OS, model and firmware combination.
