# TomorrowOS Beginners Guide

TomorrowOS is an open source unified API layer for digital signage operating systems.

This guide is for people who want to understand TomorrowOS without needing to be a developer first.

It is written for founders, product teams, integrators, support teams, sales teams, CMS vendors, hardware partners and anyone trying to understand what TomorrowOS does and why it matters.

## The simple idea

Digital signage screens and media players do not all work the same way.

A screen in a restaurant, retail store, airport, shopping centre, office, university or government building may run on different hardware and different operating systems.

Those systems can behave differently when it comes to:

- Playing images
- Playing videos
- Running widgets
- Loading ZIP packages
- Controlling screen power
- Taking screenshots
- Reporting proof-of-play
- Staying online
- Recovering from failure
- Syncing across multiple screens
- Handling firmware differences

TomorrowOS exists to make those differences easier to understand, test and manage.

## What problem does TomorrowOS solve?

Digital signage development is fragmented.

A CMS, app, widget or integration may work perfectly on one screen but fail on another.

For example:

- A video may play on one device but not another
- A widget may load on one OS but show a black screen on another
- A ZIP package may work in one player but fail in another runtime
- A screen may support power control, but only on some models
- A screenshot may be possible on one platform but impossible on another
- Proof-of-play may say content played, even if the screen was actually black
- A firmware update may change behaviour unexpectedly

TomorrowOS helps by creating one shared way to check what is supported before a feature is used.

## What is TomorrowOS?

TomorrowOS is not a full digital signage CMS.

It is a layer that helps software talk to different signage operating systems in a more consistent way.

Think of it like a common language for signage software.

Instead of a developer needing to write separate logic for every platform, TomorrowOS aims to provide one cleaner API for common signage needs.

Those needs include:

- Playback
- Content validation
- Device capability checks
- ZIP and widget package handling
- Asset download and caching
- Fallback content
- Device control
- Telemetry
- Proof-of-play
- Proof-of-display
- Synchronisation
- Testing and certification

## What is a unified API?

An API is a way for software to communicate with other software or hardware.

A unified API means developers can use one consistent set of commands instead of writing different code for every operating system.

For example, a developer may want to turn a display off.

Instead of writing totally different commands for every platform, they could use a TomorrowOS-style command like:

```ts
await tomorrow.display.power("off")
```

But before doing that, TomorrowOS should first check whether the device actually supports that feature:

```ts
const support = await tomorrow.capabilities.check("display.power")
```

If the feature is supported, the command can run.

If it is not supported, TomorrowOS can report that clearly instead of failing silently.

## What is a capability?

A capability is something a screen, media player or operating system can do.

Examples of capabilities include:

- Play a JPG image
- Play an MP4 video
- Support H.264 video
- Run a widget
- Install a ZIP package
- Control brightness
- Turn the screen on or off
- Take a screenshot
- Report proof-of-play
- Run offline
- Join a sync group
- Support video wall playback

TomorrowOS tracks these capabilities so developers know what is safe to use.

## Why capability mapping matters

Not every screen supports every feature.

Even two screens from the same brand may behave differently if they are different models or firmware versions.

TomorrowOS should avoid pretending everything works everywhere.

Instead, it should clearly mark support as:

| Status | Meaning |
| --- | --- |
| `supported` | The feature works through the standard TomorrowOS API |
| `unsupported` | The feature is not available on this OS or device |
| `partial` | The feature works, but with limits |
| `model-dependent` | The feature depends on the exact hardware model |
| `firmware-dependent` | The feature depends on firmware or OS version |
| `requires-bridge` | The feature needs an agent, native bridge or extra platform-specific layer |
| `unsafe` | The feature may be possible, but is not recommended |
| `unknown` | The feature has not been tested yet |

This makes TomorrowOS more honest and more useful in real deployments.

## What is a black gap?

A black gap is when a screen goes black, blank, frozen or broken during playback or content changeover.

This can happen when:

- A video is not ready
- A widget takes too long to load
- A file is missing
- A codec is unsupported
- A playlist changes too early
- A package fails
- A screen loses network
- A device runs out of memory
- A transition is triggered before the next item is ready

TomorrowOS treats black gaps as a serious playback issue.

The goal is simple:

> Do not remove good content from the screen until the next content is ready.

## What is atomic activation?

Atomic activation means new content should only go live when everything needed is ready.

For example, a new playlist should not activate if:

- Some files are missing
- A video failed to download
- A checksum failed
- A widget package is broken
- A fallback image is missing
- The screen does not support the required feature
- Storage is too low

Instead, TomorrowOS should keep playing the last known good content.

This helps avoid black screens and failed updates.

## What is last known good content?

Last known good content is the safe content a screen can return to if something fails.

This could be:

- A fallback image
- A previous playlist
- A previous widget package
- Emergency content
- Offline content

If a new update fails, the screen should not break.

It should return to something safe.

## What is proof-of-play?

Proof-of-play means the system recorded that content was played.

But there is an important difference:

| Type | Meaning |
| --- | --- |
| Proof-of-play | The player attempted to play the content |
| Proof-of-display | There is evidence the content actually appeared on the screen |

This matters because a system might say content played, but the physical screen could have been black, frozen or disconnected.

TomorrowOS should help separate these events clearly.

## What is a bridge?

Some operating systems do not expose every device feature directly to a normal web app.

A bridge is an extra layer that allows TomorrowOS to access deeper device features where supported.

A bridge may be needed for:

- Power control
- Screenshots
- Firmware information
- Storage access
- Native logs
- Device reboot
- Advanced telemetry
- Package handling
- Sync control

If something requires a bridge, TomorrowOS should say that clearly.

## What TomorrowOS is

TomorrowOS is:

- An open source unified API layer
- A capability mapping system
- A developer-friendly signage abstraction layer
- A way to understand OS and device differences
- A foundation for signage apps, CMS players and widgets
- A testing and certification model for signage features
- A safer way to handle playback, packages, assets and device control

## What TomorrowOS is not

TomorrowOS is not:

- A full digital signage CMS
- A finished commercial platform by default
- A guarantee that every screen supports every feature
- A replacement for proper device testing
- A production SLA
- A hardware warranty
- A support contract
- A guarantee of uptime
- A guarantee that forks or third-party products will work safely

## Who is TomorrowOS for?

TomorrowOS can help different groups.

### Developers

Developers can use TomorrowOS to build signage apps, CMS players, widgets and device integrations without rewriting core logic for every platform.

### Integrators

Integrators can use TomorrowOS to understand what a device or OS can actually support before deploying into a customer environment.

### CMS vendors

CMS vendors can use TomorrowOS as a reference for cross-platform playback, package handling, capability checks and device integration.

### Hardware partners

Hardware partners can use TomorrowOS to document and test what their devices support.

### End customers

End customers can benefit from more reliable signage networks, clearer support claims and better testing before deployment.

### Product, sales and support teams

Non-technical teams can use TomorrowOS documentation to understand what is possible, what is risky and what needs testing before making promises to customers.

## Example real-world scenario

A restaurant brand wants to run digital menu boards across hundreds of stores.

Some stores use Samsung displays.

Some use LG displays.

Some use BrightSign players.

Some screens support certain video formats.

Some do not.

Some support remote power control.

Some do not.

Some can take screenshots.

Some cannot.

Without TomorrowOS, a developer may need to write different logic for every platform.

With TomorrowOS, the app can first ask:

```ts
const support = await tomorrow.capabilities.checkMany([
  "playback.video.h264",
  "display.power",
  "telemetry.screenshot",
  "proof.play"
])
```

Then the app can make safer decisions based on what the screen actually supports.

## Why this matters for reliability

Digital signage is often public-facing.

When it fails, people notice.

A failed screen can mean:

- Lost advertising value
- Poor customer experience
- Staff confusion
- Menu pricing issues
- Brand damage
- Support tickets
- Technician callouts
- Operational disruption

TomorrowOS is designed around the real-world reliability problems that happen in signage networks.

## How to use this repository as a beginner

Start with these files:

1. `README.md`
2. `docs/README.md`
3. `docs/guides/beginners-guide.md`
4. `docs/capabilities/capability-matrix.md`
5. `docs/guides/black-gap-playback.md`
6. `docs/guides/assets-and-atomic-activation.md`
7. `docs/guides/widget-zip-packages.md`

You do not need to understand every line of code.

The main things to understand are:

- What TomorrowOS is trying to solve
- What features need to be mapped
- Which OS platforms are being considered
- What risks exist in playback and device control
- What needs testing before production
- What is safe, unsafe or unknown
- What developers should build toward

## How to use TomorrowOS if you are a developer

If you are a developer, focus on:

- The API overview
- Capability checks
- Playback examples
- Package handling
- Asset staging
- Black-gap prevention
- Telemetry events
- Proof events
- Certification tests
- OS connector documentation

Start with:

1. `docs/api/overview.md`
2. `docs/capabilities/capability-matrix.md`
3. `docs/guides/developer-guide.md`
4. `docs/testing/certification.md`
5. `examples/`

## Safe production mindset

Before using TomorrowOS in production, teams should:

- Test the exact device model
- Test the exact firmware version
- Test the runtime or browser engine
- Validate all required capabilities
- Confirm fallback content exists
- Test offline behaviour
- Test failed downloads
- Test black-gap transitions
- Test package rollback
- Test proof-of-play reporting
- Confirm security controls
- Confirm support responsibilities

TomorrowOS can help structure this process, but it does not remove the need for proper testing.

## The long-term goal

The long-term goal of TomorrowOS is to become a trusted open source layer for the digital signage industry.

A layer that makes it easier to build signage software across many operating systems while staying honest about what each platform can actually support.

The goal is not to hide complexity.

The goal is to make complexity easier to manage.
