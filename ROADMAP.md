# TomorrowOS Roadmap

TomorrowOS is an open source unified API layer for digital signage operating systems.

This roadmap outlines the intended direction of the project. It may change as the project develops, contributors provide feedback, and real-world testing reveals platform-specific limitations.

## Roadmap principles

TomorrowOS should remain:

- Simple for developers
- Honest about operating system limitations
- Safe for device control
- Useful for real signage deployments
- Open enough for the industry to build on
- Careful with security, package handling and customer environments
- Focused on reliability, fallback behaviour and capability evidence

## Current status

TomorrowOS is in early development.

The current focus is defining the foundation:

- Unified API structure
- Capability matrix
- Playback handling model
- ZIP and widget package handling
- Asset download and atomic activation model
- Black-gap prevention
- Security expectations
- Support boundaries
- Contribution guidelines
- Beginner and developer documentation

## Phase 1: Foundation

The first phase is about defining the public structure of TomorrowOS.

### Goals

- Create the main GitHub repository
- Add core trust files
- Define the project purpose
- Add contribution rules
- Add security policy
- Add disclaimer and support policy
- Create documentation structure
- Define the first API domains
- Define the capability matrix model

### Core files

- `README.md`
- `LICENSE.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `DISCLAIMER.md`
- `SUPPORT.md`
- `ROADMAP.md`

### Core documentation

- `docs/README.md`
- `docs/api/overview.md`
- `docs/capabilities/capability-matrix.md`
- `docs/guides/beginners-guide.md`
- `docs/guides/developer-guide.md`
- `docs/guides/black-gap-playback.md`
- `docs/guides/widget-zip-packages.md`
- `docs/guides/assets-and-atomic-activation.md`

## Phase 2: API definition

The second phase is about turning the high-level API overview into clear API domains.

### API areas

- Device API
- Capability API
- Playback API
- Transition API
- Package API
- Asset API
- Sync API
- Display API
- Network API
- Telemetry API
- Proof API
- Security API
- Certification API

### Goals

- Create one documentation page per API domain
- Define method names
- Define request examples
- Define response examples
- Define error formats
- Define support status behaviour
- Define fallback behaviour
- Define certification requirements for each API area

## Phase 3: Capability model

The third phase is about making capability mapping practical and evidence-based.

### Goals

- Define feature naming conventions
- Define support status rules
- Define evidence requirements
- Define tested device record format
- Define firmware-specific support handling
- Define `requires-bridge` behaviour
- Define `unsafe` behaviour
- Create sample capability records
- Create initial OS support tables

### Capability categories

- Device
- Playback
- Images
- Video
- Widgets
- Packages
- Assets
- Transitions
- Display control
- Network
- Sync
- Telemetry
- Proof
- Security

## Phase 4: OS connector documentation

The fourth phase is about documenting platform-specific behaviour.

### Target platforms

- Samsung Tizen
- LG webOS
- BrightSign OS
- Android
- ChromeOS
- Linux
- Browser-based runtimes

### Goals

For each OS, document:

- Supported runtime types
- Browser or web engine behaviour
- Media playback limitations
- Image support
- Video support
- Package support
- Device control support
- Screenshot support
- Storage behaviour
- Network behaviour
- Sync support
- Proof support
- Security considerations
- Known limitations
- Required bridge or agent behaviour

## Phase 5: SDK structure

The fifth phase is about creating the first developer-facing SDK structure.

### Goals

- Create `packages/sdk`
- Define TypeScript types
- Create basic runtime wrapper
- Add capability check helpers
- Add playback examples
- Add asset handling examples
- Add package validation examples
- Add telemetry event types
- Add proof event types
- Add error types
- Add mock runtime for testing

### Intended package

```txt
@tomorrowos/sdk
```

### Example developer flow

```bash
npx @tomorrowos/sdk init my-signage-app
cd my-signage-app
npm install
npm run dev
```

## Phase 6: CLI structure

The sixth phase is about creating a CLI to help developers validate and test TomorrowOS projects.

### Intended package

```txt
@tomorrowos/cli
```

### Potential commands

```bash
tomorrowos init
tomorrowos validate
tomorrowos certify
tomorrowos capabilities
tomorrowos package validate
tomorrowos package inspect
tomorrowos assets verify
```

### Goals

- Create starter projects
- Validate package manifests
- Validate capability records
- Run local certification tests
- Generate reports
- Help developers prepare apps for different signage environments

## Phase 7: Certification test suite

The seventh phase is about proving feature support across real devices, models and firmware versions.

### Goals

- Create a repeatable test matrix
- Create playback tests
- Create image tests
- Create video tests
- Create widget tests
- Create ZIP package tests
- Create asset download tests
- Create sync tests
- Create telemetry tests
- Create proof tests
- Create security tests
- Export certification reports

### Minimum certification areas

- Image playback
- Video playback
- Codec support
- Widget loading
- ZIP package validation
- Black-gap transitions
- Asset download and checksum
- Atomic activation
- Offline fallback
- Last known good recovery
- Sync timing
- Display controls
- Telemetry
- Proof-of-play
- Security boundaries

## Phase 8: Examples

The eighth phase is about helping developers understand how to use TomorrowOS.

### Example projects

- Basic signage app
- CMS player
- Widget package
- ZIP package validation
- Asset download and activation
- Black-gap-safe playlist
- Sync wall demo
- Proof-of-play demo
- Capability mapping demo

### Goals

- Keep examples simple
- Make examples copyable
- Show safe defaults
- Use capability checks
- Include fallback behaviour
- Avoid pretending every OS supports every feature

## Phase 9: Bridge and agent patterns

The ninth phase is about documenting and prototyping deeper OS integration.

Some features may require an agent, bridge or platform-specific layer.

### Potential bridge features

- Power control
- Reboot
- Firmware information
- Screenshots
- Local storage management
- Native logs
- Package extraction
- Device identity
- Advanced telemetry
- Sync control

### Goals

- Define what `requires-bridge` means
- Define safe bridge patterns
- Define authentication expectations
- Define local API security boundaries
- Define what should never be exposed unauthenticated
- Document OS-specific bridge considerations

## Phase 10: Community and governance

The tenth phase is about making TomorrowOS sustainable as an open source project.

### Goals

- Add governance model
- Add maintainer rules
- Add RFC process
- Add release process
- Add versioning policy
- Add trademark guidance
- Add contributor recognition
- Add community discussion structure

### Future files

- `GOVERNANCE.md`
- `TRADEMARKS.md`
- `rfcs/`
- `.github/ISSUE_TEMPLATE/`
- `.github/pull_request_template.md`

## What is not currently planned

TomorrowOS is not currently intended to be:

- A full digital signage CMS
- A hosted dashboard by default
- A guaranteed production support service
- A replacement for device testing
- A replacement for commercial support agreements
- A guarantee that every OS supports every feature
- A guarantee that forked projects or third-party implementations will work safely

## Long-term vision

The long-term vision is for TomorrowOS to become a trusted open source operating layer for digital signage.

A layer that helps developers, integrators, CMS vendors and hardware partners build better signage software across many operating systems while staying honest about what each platform can actually support.

The goal is not to hide complexity.

The goal is to make complexity easier to manage.
