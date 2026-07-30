# BrightSign OS

This page documents **how TomorrowOS works on BrightSign today**, including deploy requirements, supported commands, playback behaviour, and known field issues.

**Current support:** TomorrowOS V1 targets BrightSign **Series 3-6**. Always verify on the real model + firmware before claiming production support.

BrightSign is a first-class TomorrowOS player platform alongside Samsung Tizen. Support still depends on **player series**, **BrightSignOS (BOS) firmware**, storage layout and display setup — always verify on the real model before claiming production support.

## Purpose

This page covers:

- How to install the TomorrowOS BrightSign player on the device
- How the TomorrowOS BrightSign player boots
- Device identification and capabilities
- Content policy / playback behaviour
- Widget and package handling
- Display controls (reboot, on/off timer)
- Screenshots
- Known issues found in testing (including Series 3 / 4K H.264)
- Deploy and certification checklist

## Core principle

> BrightSign is capable, but series + firmware matter.

A feature may work on one series / BOS version and fail on another. Prefer:

1. Check `device.info.getCapabilities`
2. Test the real playlist on that model + firmware
3. Only then mark the combination production-ready

## Install the player

Supported baseline: BrightSign **Series 3-6** (validate Series 3 firmware — see known issues below).

### Get the package

| Source | What you get |
| --- | --- |
| Control Panel → **Download Players → BrightSign** (`GET /players/brightsign.zip`) | Zip with `cmsEndpoint` already set to **this** CMS origin |
| Distribution zip `https://tmr.sh/app/brightsign/brightsign_package.zip` | Mother package — you must set `cmsEndpoint` in `config.js` yourself |

### Install on the device

1. Unzip the package on a computer.
2. Confirm `config.js`:
   - CMS download: `cmsEndpoint` is usually filled — confirm `orientation`
   - Distribution zip: set `cmsEndpoint` to your CMS origin and set `orientation`
3. Copy the **contents** of the unzipped folder (not the zip file itself) onto a microSD card or USB stick.
4. Confirm the **root** of the card contains:
   - `autorun.brs`
   - `config.js`
   - the rest of the player files
5. Ensure only one `autorun.brs` exists (no competing BSN autorun artifacts).
6. Insert the card into the BrightSign player.
7. Full power-cycle the player.
8. Wait through the initial black window (~10 seconds before `Show()` is normal).
9. Confirm the pairing / brand UI appears, then pair with the **six-character** code in the Control Panel.

Do **not** put `localhost` in `cmsEndpoint`. Use a LAN IP, tunnel, or public HTTPS URL the player can reach.

## Runtime architecture

TomorrowOS on BrightSign is an HTML player launched by BrightScript:

| Piece | Role |
| --- | --- |
| `autorun.brs` | Creates `roHtmlWidget`, enables Node.js + BrightSign JS objects, hosts dual `roVideoPlayer` slots |
| `index.html` + `main.js` | Player UI, pairing, policy, playlist logic |
| `platform-brightsign.js` | Device info, reboot, download, ZIP extract, display mute, `roVideoPlayer` bridge |
| `config.js` | Boot config: `cmsEndpoint`, `orientation` |

Important boot details:

- Node.js must be enabled (`nodejs_enabled: true`)
- BrightSign JS objects must be enabled (`brightsign_js_objects_enabled: true`)
- Storage uses the SD card (`storage_path: "SD:"`)
- There is a deliberate **~10 second** delay before `Show()` — black screen during that window is normal
- Orientation and CMS URL come from `config.js` (no on-device setup UI in the current BrightSign build)

## Configure `config.js`

BrightSign builds do **not** show an on-device CMS / orientation setup screen. You must set these values in `config.js` before the player can connect:

```js
window.TOMORROWOS_CONFIG = {
  cmsEndpoint: "http://192.168.1.105:3000/",
  orientation: "landscape" // landscape | portrait-right | portrait-left
};
```

| Field | Purpose |
| --- | --- |
| `cmsEndpoint` | CMS HTTP(S) URL the player connects to (converted to `ws://` / `wss://` at runtime) |
| `orientation` | Screen orientation baked into the player bundle |

### Hosted CMS download

If you download the BrightSign player zip from a **hosted CMS** (for example Control Panel → Download Players), `cmsEndpoint` is **filled automatically** with that CMS address. You usually only need to confirm `orientation`.

### Local testing

Do **not** put `localhost` or `127.0.0.1` in `cmsEndpoint`.

The BrightSign player runs on the panel, not on your laptop. `localhost` would point at the player itself and pairing / WebSocket will fail.

For local testing, use your computer’s **LAN IP**, for example:

```js
cmsEndpoint: "http://192.168.1.105:3000/"
```

The player and CMS must be on a reachable network path (same LAN or a public/tunnel URL).

## Device identification

`device.info.get` is backed by `BSDeviceInfo`.

Typical fields:

```json
{
  "online": true,
  "deviceId": "...",
  "model": "XT1144",
  "firmware": "9.1.140",
  "serialNumber": "..."
}
```

Use model + firmware together when diagnosing playback or codec issues.

## Capability map

On a real BrightSign player runtime, `device.info.getCapabilities` currently reports:

| Command | Typical status |
| --- | --- |
| `device.info.get` | supported |
| `device.power.reboot` | supported |
| `device.content.setPolicy` | supported |
| `device.content.clear` | supported |
| `device.telemetry.captureScreen` | supported |
| `device.display.setOnOffTimer` | supported only if display mute API is available |

Always trust the live capability response over this table.

## Content and playback

Playback is policy-driven:

```ts
await tos.device(deviceId).sendCommand("device.content.setPolicy", {
  policy: {
    playlists: [
      {
        id: "lobby",
        name: "Lobby",
        items: [
          { type: "image", url: "https://cdn.example.com/promo.jpg", durationMs: 8000 },
          { type: "video", url: "https://cdn.example.com/loop.mp4" }
        ]
      }
    ]
  }
})
```

BrightSign-specific playback notes:

- Images / UI use HTML layers
- Normal playlist video uses dual **`roVideoPlayer`** slots (hardware video plane), not HTML `<video>` HWZ as the primary path
- Black-gap avoidance keeps the previous picture up until the next item is ready — see `docs/guides/black-gap-playback.md`
- Widgets (`.zip` / `.wgt`) download, extract locally and load in an iframe — see `docs/guides/widget-zip-packages.md`
- Media is cached under `downloads/tomorrowos/` on the SD card

## Display control

### Reboot

```ts
await tos.device(deviceId).sendCommand("device.power.reboot", {})
```

Uses `@brightsign/system` reboot. The player tries to save resume state before restarting.

### On / off timer

```ts
await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
  onOffTimer: { turnOnAt: "08:00", turnOffAt: "22:00" }
})
```

On BrightSign this is implemented as a **display mute / power-save style schedule** while the player stays connected. Capability is gated by whether the mute API is available.

## Screenshots

```ts
await tos.device(deviceId).sendCommand("device.telemetry.captureScreen", {})
```

BrightSign captures through the player screenshot path and returns image data to the CMS. Quality and coverage can still vary by series / firmware — certify on the target player.

## Firmware and series guidance

### Recommended baseline

TomorrowOS BrightSign development currently expects players that can run:

- `roHtmlWidget` with Node.js
- BrightSign JS objects (`BSDeviceInfo`, etc.)
- Modern Chromium behaviour used by current BOS releases for iframe / widget work

### Known issues: Series 3 video

**Finding from field testing:**

| Issue | Detail |
| --- | --- |
| Platform | BrightSign **Series 3** |
| Video playback | Firmware must be upgraded to **9.1.140** (or newer in the 9.1 line) for reliable video playback |
| 4K H.264 | Still a **hardware limit** on Series 3 — even on 9.1.140+, do not expect reliable 4K H.264 |
| Guidance | Upgrade Series 3 to **9.1.140+**, then ship **1080p H.264** (not 4K) |

Practical rules:

1. Check `device.info.get` for model + firmware before publishing video
2. On Series 3 below **9.1.140**, upgrade firmware before relying on video playlists
3. On Series 3 at **9.1.140+**, certify with **1080p H.264**
4. Treat Series 3 **4K H.264** as unsupported hardware — not a TomorrowOS playlist bug

## Deploy checklist

1. Download the BrightSign player zip (Control Panel → **Download Players → BrightSign**, or the distribution URL)
2. Confirm `cmsEndpoint` and `orientation` in `config.js`
   - Hosted CMS download: CMS URL is usually auto-filled
   - Local testing: use your PC LAN IP — never `localhost`
3. Copy **all** files from the bundle to the **SD card root**
4. Confirm only one `autorun.brs` exists (no competing BSN autorun artifacts)
5. Full power-cycle the player
6. Wait through the initial black sleep window
7. Verify pairing / `device.hello` against your CMS
8. Publish a small image + video playlist and confirm playback
9. Record **model + firmware** for certification notes

## Certification tests for BrightSign

Minimum tests per model + firmware:

- [ ] Boot to player UI / brand idle
- [ ] Pair with CMS
- [ ] `device.info.get` returns model + firmware
- [ ] `device.info.getCapabilities` looks correct
- [ ] Image playlist playback
- [ ] Video playlist playback (1080p H.264; Series 3 requires firmware **9.1.140+**)
- [ ] **4K H.264** playback (not expected on Series 3 — hardware limit; use 1080p there)
- [ ] Image ↔ video transitions without black gaps
- [ ] Widget `.zip` playback
- [ ] Offline / cached replay after disconnect
- [ ] Reboot + resume
- [ ] Screenshot capture
- [ ] On/off timer (if capability supported)
- [ ] Portrait orientation (if used)

## Related docs

- `docs/api/overview.md` — command surface
- `docs/guides/black-gap-playback.md` — BrightSign transition behaviour
- `docs/guides/widget-zip-packages.md` — widget zip handling
- `docs/guides/assets-and-atomic-activation.md` — media cache / publish flow
- BrightSign player `README.md` — build, SD layout, HDMI troubleshooting

## Goal

Document BrightSign as it behaves in real deployments: what TomorrowOS supports now, which commands work, and which Series 3 limits (**firmware 9.1.140+ for video**, **no 4K H.264 hardware**) must be handled before go-live.
