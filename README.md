</p>

<h1 align="center">TomorrowOS</h1>

<p align="center">
  <strong>The open-source foundation for digital signage software.</strong><br />
  Build a new CMS, connect an existing product, or ship a custom signage<br />experience across supported screen platforms.
</p>

<p align="center">
  <a href="https://tomorrowos.org/about">About</a> ·
  <a href="https://docs.tomorrowos.org/docs">Documentation</a> ·
  <a href="https://tomorrowos.org/docs/quickstart">Quickstart</a> ·
  <a href="https://github.com/tomorrowos/tomorrowos/discussions">Discussions</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tomorrowos/sdk"><img src="https://img.shields.io/npm/v/@tomorrowos/sdk?color=BD4E32&label=%40tomorrowos%2Fsdk" alt="npm version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-141311" alt="Apache 2.0" /></a>
  <a href="https://github.com/tomorrowos/tomorrowos/discussions"><img src="https://img.shields.io/badge/discussions-join-5D554D" alt="Discussions" /></a>
</p>

---

Every digital signage product needs the same underlying capabilities: device communication, content delivery, reliable playback, offline operation and support for different screen platforms.

TomorrowOS brings those capabilities into one open-source foundation, with a server-side SDK and on-device runtime designed to work across supported environments.

You build the product, workflows and customer experience while TomorrowOS provides and improves the shared infrastructure underneath.

**You own what you build.** Apache 2.0, no seat licences, no revenue share, no requirement to open-source your own CMS.

## What it handles

- **Device pairing and communication** — activate a screen, keep it connected 
- **Content and playlist management** — upload, assets, scheduling, 
- **Playback policies** — what plays, when, under what conditions
- **Commands and events** — reboot, screenshot, runtime telemetry back
- **Offline playback and recovery** — content running when the network doesn't
- **Platform-specific runtime behaviour** — the vendor quirks, absorbed
- **Screen and player integrations** — one API surface across supported hardware

## Quickstart

Install the SDK into a new or existing Node project:

```bash
npm install @tomorrowos/sdk
```

Pair a device and push a playlist:

```ts
import { TomorrowOS } from '@tomorrowos/sdk'

const tos = new TomorrowOS({ apiKey: process.env.TOMORROWOS_KEY })

// Claim a screen using the pairing code shown on the panel
const device = await tos.devices.pair({ code: 'A4F2-9K1D' })

// Give it something to play
await tos.playlists.assign(device.id, {
  items: [
    { type: 'image', url: 'https://cdn.example.com/promo.jpg', duration: 8000 },
    { type: 'video', url: 'https://cdn.example.com/loop.mp4' },
  ],
})

// Listen for what the screen is actually doing
tos.events.on('playback.started', (e) => console.log(e.deviceId, e.itemId))
```

This gives you a working digital signage deployment. Everything after this — scheduling, policies, multi-tenancy — builds on the same three primitives: **devices, content, events**.

→ [Full quickstart](https://tomorrowos.org/quickstart) · [API reference](https://docs.tomorrowos.org)

## How it works

```
┌─────────────────────────────────────────────────┐
│  Your product                                   │
│  CMS · App · Workflow · Data                    │
└─────────────────────────┬───────────────────────┘
                          │
┌─────────────────────────▼───────────────────────┐
│  TomorrowOS Server SDK and APIs                 │
│  Devices · Content · Policies · Commands        │
└─────────────────────────┬───────────────────────┘
                          │
┌─────────────────────────▼───────────────────────┐
│  TomorrowOS Player Runtime                      │
│  Playback · Storage · Offline operation         │
└─────────────────────────┬───────────────────────┘
                          │
┌─────────────────────────▼───────────────────────┐
│  Supported screen platforms                     │
│  Samsung Tizen · BrightSign                     │
└─────────────────────────────────────────────────┘
```

Your application decides **what** should happen. TomorrowOS handles **how** it happens across every supported screen environment.

The Player follows a stable specification. That spec is the contract: as long as a platform implements it, your application code doesn't change when you add hardware.

## Supported platforms

Support is version-specific and only listed here once it's confirmed on real hardware.

| Platform | Versions | Status |
| --- | --- | --- |
| Samsung Tizen | 6.5 – 7.0 (QMC, QMB, QHC) | ✅ Supported |
| BrightSign | Series 3, Series 4, Series 5, Series 6 | ✅ Supported |
| LG webOS | — | 🔜 Planned |
| Android | — | 🔜 Planned |

Review the [compatibility documentation](https://tomorrowos.org/docs/platforms) before any production deployment.

## What you can build

TomorrowOS is unopinionated about your product as we are purely the foundation for your to build on.

| Use case | Example |
| --- | --- |
| **Digital signage CMS** | A complete signage platform sold under your own brand |
| **Menu boards** | QSR, cafés, drive-thru and hospitality |
| **Directory & wayfinding** | Office towers, hospitals, campuses and venues |
| **Retail media networks** | Manage and deliver advertising across physical locations |
| **Internal communications** | Workplace updates, production dashboards and operational messaging |
| **Embedded signage** | Add screen and device management to an existing software product |

You keep your source, your branding and your customer relationships. TomorrowOS is invisible on deployed screens by default.

## Documentation

| | |
| --- | --- |
| [Getting started](https://tomorrowos.org/docs/getting-started) | Install, pair your first screen |
| [SDK and APIs](https://tomorrowos.org/docs/sdk) | Full server-side reference |
| [Platform support](https://tomorrowos.org/docs/platforms) | Version matrix and known quirks |
| [Deployment](https://tomorrowos.org/docs/deployment) | Self-hosting and production notes |
| [Roadmap](https://tomorrowos.org/docs/roadmap) | What's next |
| [Changelog](./CHANGELOG.md) | What changed |

## Community and support

Built by digital signage people, for digital signage people. If you’ve ever spent hours debugging a black screen on a system-on-chip display, you’re among people who understand.

- [**Discussions**](https://github.com/tomorrowos/tomorrowos/discussions) — questions, ideas, platform war stories
- [**GitHub Issues**](https://github.com/tomorrowos/tomorrowos/issues) — bugs and feature requests
- [**Contributing**](./CONTRIBUTING.md) — how to get a PR merged
- [**Code of Conduct**](./CODE_OF_CONDUCT.md) — community standards
- [**Governance**](./GOVERNANCE.md) — how decisions get made
- [**Security**](./SECURITY.md) — report a vulnerability privately

**Build your own product while improving the foundation for everyone.** Every team can create and own its own CMS, while fixes for Tizen quirks, playback bugs and device behaviour strengthen the shared infrastructure beneath the entire ecosystem.

The community contributes while maintainers protect the quality, stability and direction of the core.

## Project status

TomorrowOS is under active development and has not yet reached 1.0.

Before 1.0, APIs may change and platform support will continue to expand. Read the [changelog](./CHANGELOG.md) before deploying to production, and pin your version.

## License

TomorrowOS is available under the [Apache License 2.0](./LICENSE).

You may build commercial products on it, modify the source, self-host it, and keep your own application entirely proprietary — subject to the licence terms.

The TomorrowOS name, logo, and trademarks are **not** licensed under Apache 2.0. See [TRADEMARK.md](./TRADEMARK.md) and [NOTICE](./NOTICE).

---

<p align="center">
  <sub>TomorrowOS — Open-source digital signage foundation.</sub>
</p>
