# TomorrowOS Documentation

TomorrowOS is an open source unified API layer for digital signage operating systems.

This documentation explains how TomorrowOS works, what the unified API covers, how capability mapping should be handled, and how developers can build reliable signage apps, CMS players, widgets and device integrations across different platforms.

## Documentation structure

| Section | Purpose |
| --- | --- |
| Getting Started | Build your first TomorrowOS app or CMS player |
| API Overview | Understand the main unified API areas |
| Capability Matrix | Track what each OS, device and firmware version can safely support |
| Playback | Handle images, videos, HTML, widgets, playlists and fallbacks |
| Packages | Validate and run ZIP/widget content safely |
| Transitions | Prevent black gaps between images, videos and widgets |
| Synchronisation | Support multi-screen playback and video wall timing |
| Device Control | Work with supported screen and device functions |
| Telemetry | Report heartbeat, logs, errors, screenshots and health |
| Proof | Capture proof-of-play and proof-of-display events |
| Security | Keep device control, package handling and customer environments safe |
| Certification | Test real OS, model and firmware support before marking features as supported |

## Core concept

Digital signage development is fragmented.

A CMS player, menu board, widget, signage app or deployment tool may behave differently across:

- Samsung Tizen
- LG webOS
- BrightSign OS
- Android
- ChromeOS
- Windows
- Linux
- Browser-based signage runtimes

Each platform can have different support for:

- Media playback
- Video codecs
- Image formats
- Browser engines
- Local storage
- ZIP packages
- Widget rendering
- Device APIs
- Power control
- Screenshots
- Proof-of-play
- Synchronisation
- Offline behaviour
- Recovery logic

TomorrowOS exists to make this easier to build, test and trust.

## What TomorrowOS gives developers

TomorrowOS gives developers one clean API surface for common signage needs.

Instead of writing platform-specific logic everywhere, developers can use TomorrowOS to:

- Detect the device and operating system
- Check what a screen can safely support
- Play media with fallback behaviour
- Validate content before activation
- Prevent black gaps between content changes
- Install and run widget packages safely
- Control supported screen functions
- Report telemetry and device health
- Capture proof-of-play and proof-of-display
- Test support before claiming compatibility

## Example API flow

```ts
import { tomorrow } from "@tomorrowos/sdk"

await tomorrow.ready()

const device = await tomorrow.device.info()

const support = await tomorrow.capabilities.checkMany([
  "playback.image.jpg",
  "playback.video.h264",
  "package.zip",
  "display.power",
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

## Capability-first development

TomorrowOS should never assume every screen can do everything.

Every feature should be checked against the capability layer before it is used.

A capability may be:

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

This keeps TomorrowOS honest and useful in real deployments.

## Real-world signage problems TomorrowOS should handle

TomorrowOS should focus on the issues that cause actual signage failures, including:

- Content not playing
- Video codec mismatch
- Image format mismatch
- Browser engine limitations
- Black screens between content changes
- Failed widget loads
- ZIP packages extracting incorrectly
- Content activating before download is complete
- Partial or corrupt asset downloads
- Storage limits
- Offline screens
- Screens losing sync
- Firmware-specific behaviour
- Device APIs not being available
- Remote commands failing silently
- Proof-of-play not matching what was actually displayed
- Screenshots not being supported on some platforms
- Power control being model or firmware dependent

## Public documentation goals

The documentation should help four groups:

### Developers

People building CMS players, apps, widgets and integrations.

They need clear APIs, examples, capability checks and test flows.

### Integrators

People deploying signage in the field.

They need to know what works, what is supported, what is risky and what needs a fallback.

### CMS vendors

Companies that want their platform to run more consistently across different hardware and operating systems.

They need connector guidance, packaging guidance and capability evidence.

### End customers

Brands and organisations running signage networks.

They need confidence that the technology has been tested, documented and designed for real-world reliability.

## Documentation principles

TomorrowOS documentation should be:

- Clear
- Practical
- Honest
- Developer-friendly
- Evidence-based
- Easy to scan
- Useful for real deployments
- Careful with security and device-control claims

## Project status

TomorrowOS is in early development.

The current documentation focus is:

- Defining the unified API
- Mapping OS capability differences
- Creating safe content and package handling rules
- Documenting black-gap and playback failure handling
- Building certification tests
- Preparing the first OS connector documentation
