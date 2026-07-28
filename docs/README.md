# TomorrowOS Documentation

TomorrowOS is an open-source foundation for digital signage software: a CMS server SDK (`@tomorrowos/sdk`) and on-device players that speak one command surface across supported platforms.

This docs set describes **what exists today** — not a future wishlist. Start here, then follow the guides for your role.

## Documentation structure

| Section | Pages | Purpose |
| --- | --- | --- |
| Getting started | [Beginners guide](./guides/beginners-guide.md), [Developer guide](./guides/developer-guide.md) | Product overview, then SDK setup, pairing and publish |
| API | [API overview](./api/overview.md), [Capability matrix](./capabilities/capability-matrix.md) | Shipped `device.*` commands and support tracking |
| Guides | [Assets](./guides/assets-and-atomic-activation.md), [Widgets / ZIP](./guides/widget-zip-packages.md), [Black-gap playback](./guides/black-gap-playback.md) | Media publish, widgets, transition behaviour |
| Platforms | [Tizen](./os/tizen.md), [BrightSign](./os/brightsign.md), [webOS](./os/webos.md), [Android](./os/android.md) | Install, setup, capabilities and known limits |
| Testing | [Certification](./testing/certification.md) | How to prove support on real model + firmware |

## What exists today

| Piece | Status |
| --- | --- |
| `@tomorrowos/sdk` | Shipped — CMS server, pairing, playlists, media helpers, WebSocket commands |
| Samsung Tizen player | Shipped — **Tizen 6.5+** |
| BrightSign player | Shipped — series / firmware dependent (see BrightSign docs) |
| LG webOS | Coming soon |
| Android | Coming soon |

## Core concept

Digital signage development is fragmented.

A CMS player, menu board, widget or deployment tool may behave differently across Samsung Tizen, BrightSign and other runtimes. Codecs, storage, screenshots, power control and widget behaviour all vary by model and firmware.

TomorrowOS standardises the **CMS ↔ player contract**:

```txt
Your CMS (@tomorrowos/sdk)  ←── WebSocket + HTTPS ──→  Player (Tizen / BrightSign)
```

You own the CMS. Screens talk to **your** server. There is no required TomorrowOS cloud.

## What TomorrowOS gives developers

Instead of rewriting platform logic everywhere, you can:

- Pair devices and keep them online
- Publish playlists through `device.content.setPolicy`
- Check support with `device.info.getCapabilities` before calling hardware features
- Capture screenshots, reboot and set on/off timers where supported
- Cache media on the player for offline playback
- Run widget `.zip` / `.wgt` items as playlist content
- Reduce black gaps between images and videos inside the player

## Example API flow

```ts
import { TomorrowOS } from "@tomorrowos/sdk"

const tos = new TomorrowOS({ /* store, brand, ... */ })
await tos.listen({ port: Number(process.env.PORT) || 3000 })

const { deviceId } = await tos.pairing.verify("A4F2K1")

const capsResult = await tos.device(deviceId).sendCommand(
  "device.info.getCapabilities",
  {}
)
const caps = capsResult.data.capabilities

const playlist = await tos.playlists.savePlaylist({
  name: "Lobby",
  items: [
    { type: "image", url: "https://cdn.example.com/promo.jpg", durationMs: 8000 },
    { type: "video", url: "https://cdn.example.com/loop.mp4" }
  ]
})

if (caps["device.content.setPolicy"]?.supported) {
  await tos.playlists.publishPlaylistsToDevice(deviceId, [playlist.id])
}
```

For the full command list, see [API overview](./api/overview.md).

## Capability-first development

Never assume every screen can do everything.

Always check `device.info.getCapabilities` before relying on reboot, screenshot, on/off timer or other hardware-facing commands.

| Status | Meaning |
| --- | --- |
| `supported: true` | Works through the standard TomorrowOS command |
| `supported: false` | Not available on this runtime / device |
| firmware / model notes | Documented in platform pages and certification |

Examples of known gates:

- Tizen screenshot needs firmware **1080+**
- BrightSign Series 3 needs firmware **9.1.140+** for video; **4K H.264** is a hardware limit

## Where to go next

| If you want to… | Read |
| --- | --- |
| Understand the product | [Beginners guide](./guides/beginners-guide.md) |
| Build or host a CMS | [Developer guide](./guides/developer-guide.md) |
| Learn the command surface | [API overview](./api/overview.md) |
| Deploy on Samsung | [Tizen](./os/tizen.md) |
| Deploy on BrightSign | [BrightSign](./os/brightsign.md) |
| Certify a model + firmware | [Certification](./testing/certification.md) |

## Documentation principles

TomorrowOS docs should be:

- Clear
- Practical
- Honest about what is shipped vs coming soon
- Capability-first
- Useful for real deployments
- Careful with security and device-control claims

## Project status

TomorrowOS is under active development.

Current documentation focus:

- The shipped SDK + player command surface
- Tizen and BrightSign install / setup / known limits
- Assets, widgets and black-gap playback behaviour
- Certification evidence before calling a feature supported
