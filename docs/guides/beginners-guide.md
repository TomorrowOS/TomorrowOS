# TomorrowOS Beginners Guide

TomorrowOS helps you build and run digital signage across different screen platforms without rewriting everything for each OS.

This guide is for founders, product teams, integrators, support, sales, CMS vendors, hardware partners, and anyone who wants the big picture first — without needing to read the source code.

It describes **what exists today** in `@tomorrowos/sdk` and the TomorrowOS players (Samsung Tizen and BrightSign), not a future wishlist.

## The simple idea

Digital signage screens do not all work the same way.

A restaurant menu board, retail display, airport screen or office lobby may run on different hardware and different operating systems. Those systems differ for:

- Playing images and videos
- Running HTML widgets / ZIP packages
- Controlling power or on/off timers
- Taking screenshots
- Staying online and recovering after reboot
- Handling firmware differences

TomorrowOS gives you:

1. **A CMS server SDK** (`@tomorrowos/sdk`) — you own the CMS; the SDK handles pairing, device sessions, playlists, media helpers and the wire protocol
2. **Player apps** — run on the screen (Tizen, BrightSign today) and speak that protocol
3. **A shared command language** — dotted methods such as `device.content.setPolicy` and `device.info.getCapabilities`

You build or brand the Control Panel. Screens talk to **your** server. There is no required TomorrowOS cloud.

## What problem does TomorrowOS solve?

Without a shared layer, each CMS tends to invent its own pairing, publish and device-control path per platform.

That leads to:

- A video that plays on one device but not another
- A widget that works in one runtime and blacks out on another
- Power or screenshot features that exist only on some models
- Publish flows that push playlists before media is reachable
- Hard-to-debug “it worked in the lab” failures in the field

TomorrowOS standardises the **CMS ↔ player contract** and keeps platform details inside the player.

## What is TomorrowOS?

### What it is

- An **open-source SDK** for building your own digital signage CMS (`@tomorrowos/sdk`, Apache 2.0)
- A **player runtime** for commercial screens (Tizen and BrightSign players today)
- A **WebSocket + HTTP** protocol so the CMS can pair devices, publish playlists, reboot, capture screenshots, and more
- Starter Control Panel templates and setup guides for **Replit** and **Vercel / v0**
- Documentation for capabilities, black-gap playback, assets and certification

### What it is not

- Not a hosted TomorrowOS SaaS you must subscribe to
- Not a finished turnkey CMS product by itself (you customise the UI and business logic)
- Not a promise that every screen supports every feature
- Not a replacement for testing the exact model and firmware you ship
- Not a production SLA, hardware warranty or support contract

## The pieces (mental model)

```txt
┌─────────────────────────┐         WebSocket + HTTPS        ┌─────────────────────────┐
│  Your CMS               │  ←────────────────────────────→  │  TomorrowOS player      │
│  (@tomorrowos/sdk)      │                                  │  (Tizen / BrightSign)   │
│  Control Panel + store  │                                  │  plays media locally    │
└─────────────────────────┘                                  └─────────────────────────┘
```

| Piece | Role |
| --- | --- |
| `@tomorrowos/sdk` | Node server: pairing, devices, playlists, media upload helpers, `/status`, WebSocket |
| Control Panel | Web UI (starter included) for pairing codes, playlists, publish, screenshots |
| Player app | Runs on the screen; caches media; plays policy; reports capabilities |
| Database | Supabase / Neon / Replit Postgres / SQLite (dev) — pairing and playlist data |
| Media storage | Cloudinary, Vercel Blob, Replit Object Storage, or local uploads |

## How a screen gets content (current flow)

1. Deploy your CMS to a public HTTPS URL (or a tunnel while developing).
2. Install the TomorrowOS player on the screen and point it at that CMS URL.
3. The player shows a **pairing code**.
4. In the Control Panel, enter the code (`POST /pairing/verify`).
5. Upload media and build playlists.
6. On **Publish**, the panel **verifies** that each asset URL is reachable.
7. If verification passes, the CMS sends `device.content.setPolicy` to the player.
8. The player downloads / caches media and plays the active playlist.
9. If something fails later, the player keeps good content on screen when possible, or shows **brand idle** fallback.

That publish + policy path is how “atomic activation” works today — not a separate `assets.activate` API.

## What is a unified API?

Here “unified API” means:

- **HTTP** routes for the Control Panel and tools (`/pairing/verify`, `/devices`, `/playlists`, `/media/upload`, …)
- **WebSocket methods** for the player (`device.content.setPolicy`, `device.info.getCapabilities`, `device.telemetry.captureScreen`, …)

Developers do **not** call fictional helpers like `tomorrow.display.power("off")`.

They use the SDK instance and/or HTTP, for example:

```ts
import { TomorrowOS } from "@tomorrowos/sdk"

const tos = new TomorrowOS({ brand, store })
await tos.listen({ port: 8787 })

// Capability check (wire method)
await tos.device(deviceId).sendCommand("device.info.getCapabilities", {})

// Publish content (builds policy and pushes setPolicy)
await tos.playlists.publishPlaylistsToDevice(deviceId, [playlistId])
```

Or from the Control Panel: `POST /device/{deviceId}/assignments`.

## What is a capability?

A capability is something this **player + device** can do.

Examples:

- Play JPG / MP4
- Run a widget ZIP
- Reboot
- Set an on/off timer
- Capture a screenshot

The live check is:

```txt
device.info.getCapabilities
```

The response lists which `device.*` commands are supported on that runtime. Always check before relying on hardware-facing features.

## Black gaps, atomic activation, and fallback

### Black gap

A black gap is when the screen goes black or broken during a content change.

TomorrowOS players aim for:

> Do not remove good content from the screen until the next item is ready.

See `docs/guides/black-gap-playback.md`.

### Atomic activation (today)

Two layers:

1. **CMS publish gate** — do not push a policy if playlist media URLs fail verification
2. **Player handoff** — after `device.content.setPolicy`, cache media and switch playlists/items without wiping the screen early

See `docs/guides/assets-and-atomic-activation.md`.

### Fallback / last known good

| Layer | What happens |
| --- | --- |
| Policy cache | Last policy snapshot kept on the player for offline / reboot resume |
| Media cache | Local copies of videos / images / widgets when download succeeds |
| Brand idle | If nothing playable remains, show branding from `GET /brand.json` |

`device.content.clear` stops playback and returns to brand idle.

## Pairing, ping, and logs (plain language)

| Concept | What it means |
| --- | --- |
| Pairing code | Short code on screen; CMS verifies it and links the device |
| `device.ping` / `device.pong` | Heartbeat so the CMS knows the screen is online (not an HTTP “ping API” you call) |
| `device.log` | Player sends log lines to the CMS (read via `GET /device/{id}/logs`) |
| Screenshot | CMS calls `POST /device/{id}/screenshot` → wire method `device.telemetry.captureScreen` |

## Platforms today

| Platform | Status |
| --- | --- |
| Samsung Tizen (6.5+) | Player app supported (app version **1.0.0**) |
| BrightSign (Series 3+) | Player app supported (app version **1.0.0**) |
| LG webOS / Android / Windows | Documented as targets / certification goals; use capability honesty — do not claim full support until tested |

## Who is TomorrowOS for?

### Developers

Build a CMS with `@tomorrowos/sdk`, customise the Control Panel, deploy to Replit, Vercel, Railway, Fly, or your own Node host.

### Integrators

Pair real screens, publish playlists, and confirm capabilities on the exact model/firmware before go-live.

### CMS vendors

Use the SDK as the device session and protocol layer under your own product UI and billing.

### Hardware partners

Document and certify which `device.*` methods your stack supports.

### Product, sales and support

Use this guide to explain what is shipped, what needs testing, and what not to promise.

## Example real-world scenario

A restaurant brand runs menu boards on Samsung Tizen panels and BrightSign players.

1. They deploy one CMS built on `@tomorrowos/sdk`.
2. Each screen installs the matching TomorrowOS player and pairs with a code.
3. Before relying on screenshots or on/off timers, the CMS checks `device.info.getCapabilities`.
4. Staff upload menu videos to Cloudinary or Blob, build playlists, and publish.
5. Publish verification blocks broken media URLs.
6. Players cache files and keep previous content on screen until the new item is ready.

One CMS protocol; platform differences stay in the player.

## How to get started

### Non-developers — build and publish on Replit or Vercel

You do not need to write code. Use the AI agent on **Replit** (recommended) or **Vercel / v0**, answer a few setup questions, publish the CMS, then install and pair a player.

#### Option A — Replit (recommended)

1. Create a new Repl (Node.js).
2. Open the agent in **Power** mode.
3. Paste this prompt:

```text
Follow NPM package @tomorrowos/sdk REPLIT_SETUP.md and set up my TomorrowOS CMS.
```

4. Answer the agent’s questions (database, media storage, branding). Prefer **Supabase** for the database and **Cloudinary** (or Replit Object Storage) for media when asked.
5. When setup finishes, **Publish / Deploy** the Repl so you get a public HTTPS URL.
6. Open that URL in a browser — you should see the TomorrowOS Control Panel.
7. Install a player and pair (see **Install a player and pair** below).

To upgrade an existing Replit CMS later:

```text
Follow NPM package @tomorrowos/sdk REPLIT_UPGRADE.md to upgrade my CMS with the latest SDK.
```

#### Option B — Vercel / v0

1. Open **v0** (use **v0 Max**) or Vercel Agent with Max capability.
2. Paste this prompt:

```text
Follow NPM package @tomorrowos/sdk VERCEL_SETUP.md and set up my TomorrowOS CMS.
```

3. Answer Q1–Q3 (database, media, branding). Prefer **Supabase** or **Neon** for the database and **Cloudinary** (or Vercel Blob) for media when asked.
4. Let the agent configure Environment Variables and **Publish** (Production). Confirm the live URL loads the Control Panel (not a blank Next-only page).
5. Install a player and pair (see **Install a player and pair** below).

To upgrade an existing Vercel / v0 CMS later:

```text
Follow NPM package @tomorrowos/sdk VERCEL_UPGRADE.md to upgrade my CMS with the latest SDK.
```

#### Install a player and pair (after the CMS is live)

You need a **public HTTPS CMS URL** that the screen can reach.

1. In the Control Panel, open **Download Players**.
2. Choose your platform:
   - **Samsung Tizen** — download / install the Tizen player package (`.wgt` / URL Launcher flow; see `PLAYER_INSTALL.md` in `@tomorrowos/sdk`).
   - **BrightSign** — download the zip from **this** CMS (it embeds your CMS URL). Copy it to a microSD card and boot the player.
3. On the screen, open the TomorrowOS player and enter the **CMS URL** if the install path asks for it (BrightSign zip from your CMS usually already has it).
4. The player shows a **6-character pairing code**.
5. In the Control Panel, open pairing and enter that code.
6. The device should appear in your device list as online. Upload media, build a playlist, and **Publish** to the screen.

---

### Developers — scaffold locally, then deploy a persistent Node host

1. Scaffold and install:

```bash
npx @tomorrowos/sdk@latest init my-cms
cd my-cms
npm install
```

2. Configure environment in a `.env` file (and in your host’s secret store when you deploy). Typical production setup:

```bash
# Database (example: Supabase connection string)
TOMORROWOS_STORE=supabase
SUPABASE_URL=postgresql://...@....supabase.co:5432/postgres
DATABASE_SSL=true

# Media (example: Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# optional: CLOUDINARY_FOLDER=tomorrowos
```

Use a durable Postgres store for production pairings/playlists. Use Cloudinary (or another durable media backend the SDK supports) so uploads survive restarts.

3. Run locally to verify:

```bash
npm run dev
```

4. Deploy to a host that supports a **persistent Node.js runtime** and long-lived WebSockets, for example:

| Host | Notes |
| --- | --- |
| **Railway** | Simple Node deploy; good default |
| **Render** | Web Service with a persistent process |
| **Fly.io** | Global VMs; holds WebSockets cleanly |
| Other | Any VPS / container host that keeps Node running (not short-lived serverless without WebSocket support) |

Set the same database and media env vars on the host. Deploy so you get a public **HTTPS** CMS URL.

5. Install a player and pair:

- Control Panel → **Download Players** → Tizen or BrightSign  
- Install on the device  
- Enter CMS URL if required  
- Enter the on-screen pairing code in the Control Panel  
- Publish a playlist to confirm end-to-end  

6. Read `docs/api/overview.md` and `docs/guides/developer-guide.md` for the wire protocol and CMS APIs. Use certification docs before marking a capability as `supported` on a given model/firmware.

## Safe production mindset

Before production:

- Test the **exact** device model and firmware
- Confirm the CMS URL is public HTTPS and reachable from the screen network
- Use durable database + media storage (not ephemeral local disk on serverless)
- Verify publish checks pass for every playlist asset
- Test offline / reboot resume
- Test black-gap transitions for your real media mix
- Confirm which capabilities are supported vs unsupported on each fleet type
- Decide who owns support when a fork or custom CMS changes behaviour

TomorrowOS structures the contract. It does not remove the need for device testing.

## The long-term goal

Become a trusted open-source foundation for digital signage:

- Easier to build a CMS you own
- Clearer CMS ↔ player protocol
- Honest capability reporting across operating systems

The goal is not to hide complexity.

The goal is to make complexity manageable — and to document what is real today versus what still needs certification.
