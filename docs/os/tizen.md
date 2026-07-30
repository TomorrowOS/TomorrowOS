# Samsung Tizen

This page documents **how TomorrowOS works on Samsung Tizen today**, including install options, on-device setup, supported commands, playback behaviour, and deploy notes.

**Current support:** TomorrowOS V1 supports **Tizen 6.5 and 7.0** commercial displays only. Older generations are not supported without a separate player build or firmware path.

Tizen is a first-class TomorrowOS player platform alongside BrightSign. Support still depends on **display model**, **Tizen / firmware version**, and commercial signage privileges — always verify on the real panel before claiming production support.

## Purpose

This page covers:

- How to install the TomorrowOS Tizen player on the display
- How the TomorrowOS Tizen player boots and is configured
- On-device orientation and CMS URL setup
- Device identification and capabilities
- Content policy / playback behaviour
- Widget and package handling
- Display controls (reboot, on/off timer)
- Screenshots
- Deploy and certification checklist

## Core principle

> Tizen is capable, but model + firmware matter.

A feature may work on one commercial panel and fail on another. Prefer:

1. Check `device.info.getCapabilities`
2. Test the real playlist on that model + firmware
3. Only then mark the combination production-ready

## Install the player

Supported baseline: **Tizen 6.5 and 7.0** commercial displays.

### Option A — App Management / Custom App (recommended)

1. On the Samsung commercial display, open **App Management**.
2. Choose install / add app by **Custom App** (or **App URL** — wording varies by firmware).
3. Enter:

   ```txt
   https://tmr.sh/tizen
   ```

4. Install and launch TomorrowOS.
5. Complete orientation + CMS URL setup (see below).

### Option B — USB sideload (download from CMS)

1. Open your live CMS Control Panel → **Download Players → Samsung**.
2. Download the player package and obtain the `.wgt` and `.html`.
3. Copy those files to the **root** of a USB stick.
4. Insert the USB into the display and install / sideload the app (Home → Apps → USB / sideload — wording varies).
5. Launch TomorrowOS and complete orientation + CMS URL setup.

### Option C — Tizen Studio Device Manager

1. Install Tizen Studio.
2. Enable Developer Mode on the display (enter your PC’s IP).
3. Connect in Device Manager by IP.
4. Right-click → Install App → select the `.wgt`.
5. Complete orientation + CMS URL setup.

Signed production packages need a Samsung distributor certificate. Custom App / USB paths are fine when your environment allows them.

After install, pair with the **six-character** code shown on screen (Control Panel → **Pair**).

## Runtime architecture

TomorrowOS on Tizen is a packaged web app (`.wgt`) that uses Samsung `webapis`:

| Piece | Role |
| --- | --- |
| `TomorrowOS.wgt` | Signed Tizen package installed on the display |
| `index.html` + `main.js` | Player UI, intro, CMS setup, pairing, policy, playlist logic |
| `webapis.productinfo` / `systemcontrol` | Device info, reboot, panel mute, native screenshot |
| `webapis.avplay` (+ `avplaystore` when available) | Hardware video playback |
| `tizen.filesystem` / `tizen.download` / `tizen.archive` | Local cache, downloads, widget extract |

Important behaviour:

- First launch shows an **orientation intro**
- If no CMS URL is stored yet, the player shows an **on-device CMS setup** screen
- CMS URL is saved in `localStorage` and reused on later boots
- Press **Red (A)** after setup to re-open orientation selection
- Playback is policy-driven through `device.content.setPolicy`

## Configure CMS URL and orientation

Unlike BrightSign, the Tizen player does **not** rely on editing a `config.js` on an SD card. Setup happens on the display.

### Orientation

On first launch, pick:

- `landscape`
- `portrait-right`
- `portrait-left`

The choice is stored on the device. To change it later, press the remote **Red (A)** key to re-open the orientation intro.

### CMS URL

If the player has never saved a CMS endpoint, it shows the CMS setup screen. Enter the CMS HTTP(S) URL, for example:

```txt
http://192.168.1.105:3000/
```

or a hosted CMS:

```txt
https://your-cms.example.com/
```

The player converts `http://` / `https://` to `ws://` / `wss://` for the device WebSocket.

### Hosted CMS download

If you install / launch the Tizen player from a **hosted CMS** (Control Panel → Download Players → Samsung, URL Launcher pointing at your CMS `.wgt`, etc.), use **that same CMS origin** as the CMS URL on the setup screen.

The Tizen package itself does not bake BrightSign-style `config.js` values. You still enter (or confirm) the CMS address on the panel the first time, then it is remembered.

### Local testing

Do **not** enter `localhost` or `127.0.0.1` as the CMS URL.

The Tizen app runs on the Samsung display, not on your laptop. `localhost` would point at the TV itself and pairing / WebSocket will fail.

For local testing, use your computer’s **LAN IP**, for example:

```txt
http://192.168.1.105:3000/
```

The display and CMS must be on a reachable network path (same LAN, or a public / tunnel URL).

## Device identification

`device.info.get` uses Tizen product / system APIs.

Typical fields:

```json
{
  "online": true,
  "deviceId": "...",
  "model": "QM43C",
  "firmware": "...",
  "serialNumber": "..."
}
```

Use model + firmware together when diagnosing playback or codec issues.

## Capability map

On a real Tizen runtime (`window.webapis` present), `device.info.getCapabilities` currently reports:

| Command | Typical status |
| --- | --- |
| `device.info.get` | supported |
| `device.power.reboot` | supported |
| `device.content.setPolicy` | supported |
| `device.content.clear` | supported |
| `device.telemetry.captureScreen` | supported when firmware is **1080+** |
| `device.display.setOnOffTimer` | supported |

Always trust the live capability response over this table.

### Screenshot firmware requirement

For `device.telemetry.captureScreen` to work reliably, the Samsung commercial display firmware must be at least **1080**.

| Requirement | Detail |
| --- | --- |
| Command | `device.telemetry.captureScreen` |
| Minimum firmware | **1080** (or newer) |
| Guidance | On older firmware, screenshot may fail even if pairing and playback work |

Practical rules:

1. Check `device.info.get` for the panel firmware before relying on screenshots
2. If capture fails on an otherwise healthy panel, upgrade firmware to **1080+** and re-test
3. Do not treat screenshot support as universal across all Tizen signage firmware builds

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

Tizen-specific playback notes:

- Images / UI use dual HTML content layers
- Playlist video prefers **AVPlay** hardware playback (dual players via `avplaystore` when available)
- Black-gap avoidance keeps the previous picture up until the next item is ready — see `docs/guides/black-gap-playback.md`
- Widgets (`.zip` / `.wgt`) download, extract locally and load in an iframe — see `docs/guides/widget-zip-packages.md`
- Media is cached under the Tizen app download / private storage paths
- App orientation and system orientation are composed carefully so portrait / landscape stay correct for both HTML and AVPlay

## Display control

### Reboot

```ts
await tos.device(deviceId).sendCommand("device.power.reboot", {})
```

Uses `webapis.systemcontrol.rebootDevice`. The player tries to save resume state before restarting.

### On / off timer

```ts
await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
  onOffTimer: { turnOnAt: "08:00", turnOffAt: "22:00" }
})
```

On Tizen this is implemented with **panel mute** scheduling while the device stays connected. Capability is gated by `setPanelMute`.

## Screenshots

```ts
await tos.device(deviceId).sendCommand("device.telemetry.captureScreen", {})
```

Tizen prefers the native `systemcontrol.captureScreen` path when available, with a canvas fallback.

**Firmware requirement:** screenshot needs commercial firmware **1080+**. Older firmware may fail capture even when the rest of the player works.

## Supported baseline

V1 targets:

- Samsung commercial displays on **Tizen 6.5 and 7.0**
- Tizen web package install (Custom App URL, USB sideload, or Device Manager)

## Deploy checklist

1. Install the Tizen player:
   - **Custom App** URL `https://tmr.sh/tizen` (recommended), **or**
   - Control Panel → **Download Players → Samsung** + USB sideload, **or**
   - Tizen Studio Device Manager
2. On first boot, choose **orientation**
3. Enter the **CMS URL**
   - Hosted CMS: use that CMS’s public HTTPS origin
   - Local testing: use your PC LAN IP — never `localhost`
4. Confirm the player reaches pairing / brand idle
5. Pair with the 6-character code in the Control Panel
6. Publish a small image + video playlist and confirm playback
7. Record **model + firmware** for certification notes

## Certification tests for Tizen

Minimum tests per model + firmware:

- [ ] Boot to intro / CMS setup / pairing UI
- [ ] Orientation selection works (including Red A reselect)
- [ ] CMS URL save rejects unreachable / invalid values
- [ ] Pair with CMS
- [ ] `device.info.get` returns model + firmware
- [ ] `device.info.getCapabilities` looks correct
- [ ] Image playlist playback
- [ ] Video playlist playback (H.264)
- [ ] Image ↔ video transitions without black gaps
- [ ] Widget `.zip` / `.wgt` playback
- [ ] Offline / cached replay after disconnect
- [ ] Reboot + resume
- [ ] Screenshot capture (requires firmware **1080+**)
- [ ] On/off timer (if capability supported)
- [ ] Portrait orientation (if used)

## Related docs

- `docs/api/overview.md` — command surface
- `docs/guides/black-gap-playback.md` — Tizen transition behaviour
- `docs/guides/widget-zip-packages.md` — widget zip handling
- `docs/guides/assets-and-atomic-activation.md` — media cache / publish flow
- `@tomorrowos/sdk` `PLAYER_INSTALL.md` — install and pairing steps

## Goal

Document Tizen as it behaves in real deployments: what TomorrowOS supports now, how to set CMS URL and orientation on the panel, and which install paths are production-ready.
