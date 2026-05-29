# TomorrowOS

**Open source SDK and protocol for digital signage.**

TomorrowOS is an open-source SDK and protocol for building digital signage apps, CMS players, widgets and device experiences across different signage operating systems.

The goal is simple: help developers build once, validate clearly, and run reliably across platforms like Samsung Tizen, LG webOS, BrightSign OS, Android and browser-based signage runtimes.

---

## Why TomorrowOS exists

Digital signage development is fragmented. Every operating system has different rules for playback, browser support, media formats, storage, device control, app packaging, synchronisation, telemetry and proof-of-play.

TomorrowOS gives developers one clean API surface for the core capabilities digital signage needs:

- Playback (image, video, widget)
- Content validation
- Device capability detection
- Screen and device control
- Telemetry and health checks
- Proof-of-play
- Synchronisation
- Fallback and recovery

Instead of guessing what each screen can do, TomorrowOS gives developers a clear capability layer.

---

## Example

```ts
import { tomorrow } from "@tomorrowos/sdk"

await tomorrow.ready()

const support = await tomorrow.capabilities.check("playback.video.h264")

if (support.status === "supported") {
  await tomorrow.playback.play({
    type: "video",
    src: "/assets/promo.mp4",
    fallback: "/assets/fallback.jpg"
  })
} else {
  await tomorrow.playback.play({
    type: "image",
    src: "/assets/fallback.jpg"
  })
}
```
