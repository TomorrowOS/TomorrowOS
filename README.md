<h1 align="center">TomorrowOS</h1>

<p align="center">
  <strong>The open-source foundation for digital signage software.</strong><br />
  Build a new CMS, connect an existing product, or ship a custom signage<br />experience across supported screen platforms.
</p>

<p align="center">
  <a href="https://tomorrowos.org/about">About</a> ·
  <a href="./docs/guides/beginners-guide.md">Documentation</a> ·
  <a href="./docs/guides/beginners-guide.md">Quickstart</a> ·
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

## Requirements

| | |
| --- | --- |
| Node.js | **20** or newer |
| npm | 10 or newer (or a compatible client) |

The CMS SDK and generated starters require Node 20+ (`better-sqlite3`, `@vercel/blob`, and the starter `engines` field).

## Quickstart

Scaffold a CMS, install dependencies, and start the local server:

```bash
npx @tomorrowos/sdk@latest init my-cms
cd my-cms
npm install
npm run dev
```

This starts a local TomorrowOS CMS server and Control Panel. To connect a physical screen, deploy the CMS to a reachable HTTPS address, install a supported TomorrowOS player, and pair it using the six-character code shown on screen.

Everything after that — playlists, policies, scheduling, multi-tenancy — builds on the same foundation: **your CMS server**, **a paired player**, and **content pushed to the device**.

## Connect your first screen

Your CMS must be reachable from the panel (public HTTPS in production, or a LAN IP / tunnel for lab tests — never `localhost` on the screen).

### Samsung Tizen (6.5 and 7.0)

1. On the display, open **App Management** and install via **Custom App** URL:

   ```txt
   https://tmr.sh/tizen
   ```

   Or download the player from Control Panel → **Download Players → Samsung** and install via USB.
2. Choose orientation, then enter your **CMS URL** on the on-device setup screen.
3. Enter the **six-character** pairing code in the Control Panel → **Pair**.

### BrightSign (Series 3-6)

1. Download the player zip from Control Panel → **Download Players → BrightSign** (CMS URL is filled into `config.js`),  
   or from `https://tmr.sh/app/brightsign/brightsign_package.zip` and set `cmsEndpoint` yourself.
2. Unzip and copy the **contents** to the SD card root (`autorun.brs`, `config.js`, and player files).
3. Confirm `orientation`, insert the card, power-cycle, then pair with the **six-character** code.

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
| Samsung Tizen | Tizen 6.5 and 7.0 | Supported |
| BrightSign | Series 3-6 | Supported |
| LG webOS | — | Planned |
| Android | — | Planned |
| Windows | — | Planned |

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
| [Getting started](./docs/guides/beginners-guide.md) | Install, pair your first screen |
| [SDK and APIs](./docs/api/overview.md) | Full server-side reference |
| [Platform support](./docs/testing/certification.md) | Version matrix and known quirks |
| [Deployment](./docs/guides/developer-guide.md) | Self-hosting and production notes |
| [Roadmap](./ROADMAP.md) | What's next |
| [Changelog](./CHANGELOG.mdx) | What changed |

## Community and support

Built by digital signage people, for digital signage people. If you’ve ever spent hours debugging a black screen on a system-on-chip display, you’re among people who understand.

- [**Discussions**](https://github.com/tomorrowos/tomorrowos/discussions) — questions, ideas, platform war stories
- [**GitHub Issues**](https://github.com/tomorrowos/tomorrowos/issues) — bugs and feature requests
- [**Contributing**](./CONTRIBUTING.mdx) — how to get a PR merged
- [**Code of Conduct**](./CODE_OF_CONDUCT.md) — community standards
- [**Governance**](./GOVERNANCE.md) — how decisions get made
- [**Security**](./SECURITY.md) — report a vulnerability privately

**Build your own product while improving the foundation for everyone.** Every team can create and own its own CMS, while fixes for Tizen quirks, playback bugs and device behaviour strengthen the shared infrastructure beneath the entire ecosystem.

The community contributes while maintainers protect the quality, stability and direction of the core.

## Project status

TomorrowOS is under active development and has not yet reached 1.0.

Before 1.0, APIs may change and platform support will continue to expand. Read the [changelog](./CHANGELOG.mdx) before deploying to production, and pin your version.

## License

TomorrowOS is available under the [Apache License 2.0](./LICENSE).

You may build commercial products on it, modify the source, self-host it, and keep your own application entirely proprietary, subject to the licence terms.

The TomorrowOS name, logo, and trademarks are **not** licensed under Apache 2.0. See [TRADEMARK.md](./TRADEMARK.md) and [NOTICE](./NOTICE).

---

<p align="center">
  <sub>TomorrowOS — Open-source digital signage foundation.</sub>
</p>
