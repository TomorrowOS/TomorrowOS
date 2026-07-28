# Black Gap and Playback Transitions

A black gap is a brief (or stuck) black / blank / frozen frame when the player changes content.

TomorrowOS treats black gaps as a **player-owned** failure mode. The CMS (`@tomorrowos/sdk`) publishes a verified policy; the **Tizen** and **BrightSign** players keep the current picture on screen until the next item is ready, then hand off.

This guide describes **what the shipped players do today** for image and video transitions — not a fictional transition API.

## Core principle

> Never take good content off screen until the next content is ready.

Shared player pattern:

1. Two HTML **content layers** (front / back). Next item mounts on the back while the front stays visible.
2. Image and video handoffs use an **instant** layer swap (not a fade). Opacity crossfade is reserved for widgets/web.
3. Video often lives on a **hardware plane** (Tizen AVPlay / BrightSign `roVideoPlayer`). The player bridges HTML ↔ hardware so neither plane exposes black between items.
4. Media is **cached locally** before play (see `assets-and-atomic-activation.md`).

This guide covers only:

| Case | Meaning |
| --- | --- |
| **Image → image** | Next item is another image |
| **Image → video** | Image hands off to video |
| **Video → image** | Video hands off to image |
| **Video → video** | Next item is another video |
| **Loops** | Single image, single video, multi-item image/video playlists |

---

## Shared mechanisms (both players)

| Mechanism | Role |
| --- | --- |
| Dual content layers | Mount next on back; keep front visible; then swap |
| Instant swap | Image/video: no fade that could flash the black background |
| Image decode warmup | Off-DOM decode pool at playlist start |
| Image prefetch | When the **next** item is an image and the playlist has **more than one** item, mount it on the back layer early |
| Local cache | Play from device storage, not a live network pull at cut time |

---

## Image → image

### Tizen

1. While the current image is on screen, the player **prefetches** the next image onto the back layer (multi-item only).
2. At advance time it **consumes** that prefetch and does an **instant** layer swap — the next image is already painted under the previous one.
3. If prefetch was missed (cold path), it mounts on the back layer (using decode warmup when available), then instant-swaps.

### BrightSign

Same dual-layer + prefetch + instant-swap path as Tizen. No `roVideoPlayer` involvement. Prefetch logs as image→image handoff prep; decode warmup feeds `mountImageInLayer`.

---

## Image → video

### Tizen

1. Keep the **image on the front** layer.
2. Mount video on the **back** (prefer **dual AVPlay** via `avplaystore` when available; else single `webapis.avplay`; else HTML `<video>`).
3. Wait for **first-frame readiness** (AVPlay: `oncurrentplaytime` or a short timeout; HTML: `playing` + paint frames).
4. **Instant** layer swap — only then clear the previous image.
5. With AVPlay, HTML is made transparent so the hardware video plane shows through.

### BrightSign

Video uses dual **`roVideoPlayer`** slots (not HTML HWZ for the normal playlist path).

1. Keep the HTML image visible.
2. Start the next `roVideoPlayer` with a **hide-HTML delay** (~300ms): play the file first, then fade the HTML widget alpha to 0 so the video plane covers the old image.
3. After a short JS delay (~420ms), **instant** layer-swap the HTML bookkeeping under the already-hidden widget.
4. Gap cover = HTML image stays up until the video plane is actually playing, then HTML is hidden.

---

## Video → image

### Tizen

1. During video (multi-item), **prefetch** the next image onto the back layer while AVPlay is still running.
2. Dual AVPlay advances on **`onstreamcompleted`** (not a wall-clock guess). For video → image it starts the image path **without** stopping AVPlay first — the last video frame stays up.
3. Consume prefetch (or cold-mount) → **instant** layer swap so the image is in the HTML stack.
4. Then hold the video with **`setVideoStillMode("true")`**, wait for HTML paint (~2 frames + short delay), and only then stop AVPlay / dual players.

### BrightSign

1. Prefetch next image on the back layer while `roVideoPlayer` is still the active element (HTML stop is skipped while ro-video is active).
2. Instant-swap so the **HTML image is visible**.
3. Then **`handoffBrightSignRoVideoToHtml`**: wait for paint frames + ~120ms, restore HTML alpha, and `StopClear` both ro-video slots.
4. Gap cover = image on screen **before** the video plane is torn down.

---

## Video → video

### Tizen (primary: dual AVPlay)

When `webapis.avplaystore` is available:

1. Two AVPlay instances ping-pong on **`onstreamcompleted`**.
2. Completed slot: **`setVideoStillMode("true")`** then `stop()` — last frame frozen.
3. Other slot: `open` → `prepareAsync` → still mode off → `play()`.
4. **No** HTML layer remount for mid-playlist video → video — the cut stays on the hardware plane.
5. Next file is warm-cached ahead of time.

Fallback paths:

- **Single AVPlay** — soft remount / preserve visual where possible; wait for first-frame gate; instant layer swap after mount.
- **HTML `<video>`** — start the next item ~420ms early (`VIDEO_TO_VIDEO_LEAD_MS`), mount on back until `playing`, then instant swap.

### BrightSign

1. Playlist video uses two **`roVideoPlayer`** slots with a **rising z-index**.
2. Next clip plays on the other slot at a higher z; the previous slot is **not** cleared while a ro-video remains active.
3. HTML stays alpha 0 across the cut (`hideHtmlDelayMs: 0` when already on ro-video).
4. Instant HTML layer swap is bookkeeping only — the visible cut is slot overlap on the video plane.

---

## Loops

### Single image loop

One image, repeating.

| Platform | Behaviour |
| --- | --- |
| **Tizen** | On wrap, **no remount / no swap** — only reset the dwell timer. Prefetch is skipped (`items.length <= 1`). |
| **BrightSign** | Same: detect same single-image loop and keep the existing image on screen. |

No transition → no black-gap opportunity.

### Single video loop

One video, repeating.

| Platform | Behaviour |
| --- | --- |
| **Tizen (dual AVPlay)** | On stream complete, seamless-switch to the **other** slot with the **same** file (still-mode bridge), or **`replayVideoInPlace`** (`seekTo(0)` + play) when in-place loop applies. |
| **Tizen (HTML)** | Element may use native `loop`; playlist timer can also seek/replay in place. |
| **BrightSign** | Mount with `AlwaysLoop` when the playlist has one item; on timer wrap, **`replayVideoInPlace`** on the **same** slot (`seekMs: 0`, no HTML handoff). Full remount only if in-place replay fails. |

Goal: avoid tearing down the decoder every lap.

### Multi-item image / video loops

Playlist with two or more images and/or videos, cycling.

Shared behaviour on both players:

1. One lap uses a **frozen** item list; hot policy updates that change composition apply on wrap.
2. Mid-loop **image → image** / **video → image**: image prefetch on the back layer is the main anti-gap tool.
3. Mid-loop **video → video**: platform dual-player path (AVPlay store / dual `roVideoPlayer`).
4. Mid-loop **image → video**: keep image until video first frame / hide-HTML timing (platform-specific above).
5. At **wrap to index 0**, prefetch for item 0 is cleared before restart — first item of the new lap may cold-mount; decode warmup and background cache still reduce risk.
6. If composition changed on wrap, players take a full remount path instead of the in-place shortcuts.

---

## Quick reference

| Transition | Tizen | BrightSign |
| --- | --- | --- |
| **Image → image** | Prefetch on back layer → instant swap | Same |
| **Image → video** | Mount video → wait first frame → instant swap; AVPlay under transparent HTML | Play `roVideoPlayer` → delay hide HTML (~300ms) → swap (~420ms) |
| **Video → image** | Prefetch image; still-mode hold; swap HTML; then stop AVPlay | Prefetch image; swap HTML; then stop ro-video + show HTML |
| **Video → video** | Dual AVPlay + `setVideoStillMode` ping-pong | Dual `roVideoPlayer` + rising z-index overlap |
| **Single image loop** | No remount | No remount |
| **Single video loop** | Dual seamless / in-place seek | `AlwaysLoop` / same-slot replay |
| **Multi-item loop** | Prefetch + dual video paths; wrap may cold-mount item 0 | Same pattern on ro-video + HTML layers |

---

## What the SDK does (and does not)

`@tomorrowos/sdk` does **not** run these transitions. It:

- Verifies media reachability on publish
- Sends `device.content.setPolicy` with playlist URLs / hashes
- Lets the player cache and play

Black-gap safety is implemented **inside** the Tizen and BrightSign player apps.

---

## How to validate

On a real panel, publish playlists that exercise:

- [ ] Image → image (two different images)
- [ ] Image → video
- [ ] Video → image
- [ ] Video → video (two different videos)
- [ ] Single image loop (long dwell)
- [ ] Single video loop
- [ ] Mixed multi-item loop (image / video / image / video …) for several full cycles

Watch for black flashes at cuts and at loop wrap. Certify per model / firmware before calling a transition path production-safe.

## Goal

Keep the last good frame on screen until the next item can display — using dual HTML layers for images, and platform dual video players (AVPlay / `roVideoPlayer`) for video — so playlists look continuous on Tizen and BrightSign.
