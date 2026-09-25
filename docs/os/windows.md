# Windows - supported

This page documents **how TomorrowOS works on Windows today**, including install options, on-device setup, supported commands, playback behaviour, and deploy notes.

**Current support:** TomorrowOS Windows Player V1 targets **Windows 11 Pro (x64)** as a native signage appliance. Windows 10, Home editions, and ARM64 are out of V1 scope unless separately certified.

Windows is a first-class TomorrowOS player platform alongside Samsung Tizen and BrightSign. Support still depends on **PC / SoC hardware**, **Windows edition + build**, **GPU / display drivers**, and **WebView2 Runtime** — always verify on the real machine before claiming production support.

## Purpose

This page covers:

- How to install the TomorrowOS Windows player
- How the Windows player boots (Watchdog → Player → WebView2)
- CMS URL, orientation, display, and maintenance passcode setup
- Signage hardening (Prepare Windows / `/harden`)
- Device identification and capabilities
- Content policy / playback behaviour
- Widget and package handling
- Display controls (reboot, on/off timer)
- Screenshots
- Deploy and certification checklist

## Core principle

> Windows is capable, but hardware + edition + WebView2 matter.

A feature may work on one PC / GPU stack and fail on another. Prefer:

1. Check `device.info.getCapabilities`
2. Test the real playlist on that machine + Windows build
3. Only then mark the combination production-ready

## Install the player

Supported baseline: **Windows 11 Pro x64** with [.NET-compatible](https://dotnet.microsoft.com/download) runtime packaging and **WebView2 Evergreen Runtime**.

### Option A — Interactive installer (recommended for first device)

1. Build or obtain `TomorrowOS-Windows-Setup.exe` from the Windows player repository (`npm run build` → `build/windows/`).
2. Run the installer as administrator.
3. Complete the wizard:
   - CMS endpoint
   - Orientation
   - Playback display index
   - Maintenance passcode
   - Optional signage hardening (sleep / screensaver / overlays / taskbar)
4. After install, Watchdog autostarts at login and launches the Player.
5. Pair with the **six-character** code shown on screen (Control Panel → **Pair**).

### Option B — Silent / fleet install

```bat
TomorrowOS-Windows-Setup.exe /silent /cms "https://your-cms.example.com" /passcode "change-me" /orientation landscape /display 0 /harden
```

| Flag | Purpose |
| --- | --- |
| `/silent` | Non-interactive install |
| `/cms` | CMS HTTP(S) URL written into `config.js` |
| `/passcode` | **Required** for silent install — maintenance exit passcode |
| `/orientation` | `landscape` \| `portrait-right` \| `portrait-left` |
| `/display` | Monitor index (default `0`) |
| `/fit` | `contain` \| `cover` \| `stretch` (content fit) |
| `/harden` | Apply signage hardening defaults |
| `/dir` | Install directory (default `C:\Program Files\TomorrowOS`) |
| `/noautostart` | Skip login autostart |
| `/nowatchdog` | Do not start Watchdog after install |
| `/keepdisplayoff` | With `/harden`, leave Windows “turn off display” alone |

Each device stores its own hashed maintenance passcode locally. There is no universal master password.

### Uninstall

Run `TomorrowOS.Uninstall.exe` from the install folder. Confirm **Uninstall TomorrowOS Windows**, wait for progress, then **Uninstall successful**.

### Local / lab without installer

For development only, publish Player + Watchdog to a folder and launch `TomorrowOS.Player.exe` (see the Windows repo `README.md`). Set `core/config.js` `cmsEndpoint` first, or leave it empty to use the on-device CMS setup UI.

## Runtime architecture

TomorrowOS on Windows is a **native .NET host** that embeds the shared HTML player in **WebView2**:

| Piece | Role |
| --- | --- |
| `TomorrowOS-Windows-Setup.exe` | Interactive / silent installer; writes `config.js` + settings |
| `TomorrowOS.Watchdog.exe` | Login autostart, single-instance, restart on crash / stale heartbeat |
| `TomorrowOS.Player.exe` | Borderless fullscreen WPF + WebView2 host + native bridge |
| `index.html` + `main.js` | Player UI, intro / CMS setup, pairing, policy, playlist logic |
| `platform-windows.js` | Host bridge: FS, download, ZIP extract, reboot, mute overlay, screenshot |
| `config.js` | Boot config written by Setup: `cmsEndpoint`, `orientation`, `displayIndex`, `contentFit` |

Boot path:

```text
Login → Watchdog → Player (WebView2) ↔ native bridge ↔ CMS WebSocket
```

Paths:

| Path | Purpose |
| --- | --- |
| `%ProgramData%\TomorrowOS\storage` | Local media cache / downloads |
| `%ProgramData%\TomorrowOS\settings.json` | Install / runtime settings |
| Install folder (default `C:\Program Files\TomorrowOS`) | Player, Watchdog, `config.js`, uninstaller |

Important behaviour:

- Installer (or `config.js`) supplies CMS URL + orientation when possible
- If no CMS URL is stored yet, the player can show an **on-device CMS setup** screen
- Platform id reported to CMS: `windows`
- Press **Ctrl+Shift+Alt+M**, then enter the maintenance passcode, to exit / restart Windows from the appliance UI
- Lab fallback passcode (only if installer settings are missing): `tomorrow`
- Playback is policy-driven through `device.content.setPolicy`

## Configure CMS URL and orientation

Windows can be configured **at install time** (like BrightSign’s `config.js`) **or** on-device when the CMS URL is empty (closer to Tizen’s setup UI).

### Via installer / `config.js`

Setup writes (or overwrites) `config.js`:

```js
window.TOMORROWOS_CONFIG = {
  cmsEndpoint: "http://192.168.1.105:3000/",
  orientation: "landscape", // landscape | portrait-right | portrait-left
  contentFit: "cover",      // contain | cover | stretch
  displayIndex: 0
};
```

| Field | Purpose |
| --- | --- |
| `cmsEndpoint` | CMS HTTP(S) URL (converted to `ws://` / `wss://` at runtime) |
| `orientation` | App content orientation |
| `contentFit` | How media fills the playback surface |
| `displayIndex` | Which connected monitor shows the player |

### Hosted CMS

Use the **same CMS origin** you want the device to pair with (public HTTPS or reachable LAN URL). Unlike BrightSign’s Control Panel zip download path, Windows V1 is currently distributed as the native Setup binary from the Windows player repo / your own release channel — confirm how your fleet obtains the `.exe`.

### Local testing

Do **not** enter `localhost` or `127.0.0.1` as the CMS URL when the player runs on a different machine than the CMS.

For local testing against a CMS on your laptop, use that computer’s **LAN IP**, for example:

```txt
http://192.168.1.105:3000/
```

The Windows PC and CMS must be on a reachable network path (same LAN, or a public / tunnel URL).

## Device identification

`device.info.get` is backed by the native host (`DeviceInfoService` / WMI + registry).

Typical fields:

```json
{
  "online": true,
  "deviceId": "...",
  "model": "Dell Inc. Latitude 7440",
  "firmware": "...",
  "serialNumber": "...",
  "hostname": "SIGNAGE-01",
  "osEdition": "Windows 11 Pro (24H2)",
  "playerVersion": "1.0.0",
  "bootUptimeSec": 12345
}
```

Notes:

- `deviceId` prefers a stable SMBIOS UUID / `MachineGuid` (pairing identity)
- `model` / `serialNumber` come from hardware / BIOS when available
- Use **model + Windows edition/build + GPU** together when diagnosing playback or codec issues

## Capability map

On a real Windows player runtime (WebView2 host bridge present), `device.info.getCapabilities` currently reports:

| Command | Typical status |
| --- | --- |
| `device.info.get` | supported |
| `device.power.reboot` | supported |
| `device.content.setPolicy` | supported |
| `device.content.clear` | supported |
| `device.telemetry.captureScreen` | supported |
| `device.display.setOnOffTimer` | supported |

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

Windows-specific playback notes:

- Images / UI / V1 video play inside **WebView2** (HTML / Media element path)
- Native Media Foundation dual-buffer video can replace the HTML video path later **without** changing the CMS contract
- Black-gap avoidance keeps the previous picture up until the next item is ready — see `docs/guides/black-gap-playback.md`
- Widgets (`.zip` / `.wgt`) download, extract locally via the host bridge and load in an iframe — see `docs/guides/widget-zip-packages.md`
- Media is cached under `%ProgramData%\TomorrowOS\storage`
- HTML widgets are architecturally allowed via WebView2 isolation but are **not** the V1 certification focus

## Display control

### Reboot

```ts
await tos.device(deviceId).sendCommand("device.power.reboot", {})
```

Uses the native host `device.reboot` bridge. The player tries to save resume state before restarting.

### On / off timer

```ts
await tos.device(deviceId).sendCommand("device.display.setOnOffTimer", {
  onOffTimer: { turnOnAt: "08:00", turnOffAt: "22:00" }
})
```

On Windows V1 this is implemented as a **quiet / black overlay** (`display.setMuted`) while the device stays connected — not a full Windows power-off of the PC. Capability is gated by `canSetDisplayMute`.

## Screenshots

```ts
await tos.device(deviceId).sendCommand("device.telemetry.captureScreen", {})
```

Windows captures through the native host screenshot path and returns image data to the CMS. Quality and multi-monitor coverage can still vary by GPU / driver — certify on the target machine.

## Maintenance and appliance mode

Ordinary users should not be able to leave the player. Technicians:

1. Press **Ctrl+Shift+Alt+M**
2. Enter the **device maintenance passcode** set at install time
3. Exit / restart as needed

The passcode is **hashed and stored on this device only**. There is no universal master password across a fleet — each install should use its own site passcode.

Treat shared “developer / unhardened” installs as lab-only — not production signage. See **Hardening** below for the appliance settings applied at install time.

## Hardening (Prepare Windows)

Hardening turns a normal Windows 11 Pro PC into a **dedicated signage appliance**: the player stays on top, the screen stays awake, and consumer Windows UI (toasts, Game Bar, screensaver, sleep) stays out of the way.

It does **not** disable Windows security updates. Updates stay on; the optional “maintenance window” toggle only steers when they prefer to install.

### When it is applied

| Install path | Behaviour |
| --- | --- |
| Interactive wizard → **Prepare Windows** | Per-toggle list (see table below). Defaults **on** for dedicated / standard installs |
| Interactive → **Developer / test** or **Shared Windows device** | Hardening defaults **off** (lab / shared PC) |
| Silent `/harden` | Enables the common Setup hardening set: screensaver off, prevent display turn-off, disable sleep, disable Game Bar overlays, plus the optional PowerShell script |
| Silent without `/harden` | Player installs, but Windows power / overlay settings are left alone |

Dedicated production screens should use hardening (wizard defaults or `/harden`). Shared lab PCs should not.

### What each toggle does

Installer step label: **Prepare Windows**. Critical items are strongly recommended for production; turning them off shows a warning in the wizard.

| Toggle (UI) | What it does | Production |
| --- | --- | --- |
| **Start TomorrowOS automatically after login** | Registers login startup so Watchdog / Player resume without someone sitting at the PC | Critical |
| **Prevent screen turn-off** | Sets Windows “Turn off my screen after” to **Never** so the panel stays lit during playback | Critical |
| **Disable sleep** | Stops Windows suspending the PC (including quiet hours) | Critical |
| **Disable hibernation** | Turns hibernation off and can free disk for the content cache | Optional |
| **Disable screen saver** | Blocks the Windows screensaver overlay only — does **not** replace sleep / display-off toggles | Critical |
| **Hide Windows notifications during playback** | Suppresses system / app toasts over content | Critical |
| **Hide taskbar during playback** | Keeps taskbar / Start off-screen while the player has focus | Critical |
| **Hide mouse cursor after inactivity** | Hides the pointer during playback | Optional |
| **Disable fullscreen game overlays** | Turns off Game Bar / capture overlays that can interrupt fullscreen | Optional |
| **Configure Windows update maintenance window** | Keeps updates enabled, but prefers install outside playback hours (Active Hours style) | Critical |
| **Start watchdog recovery service** | Watchdog monitors player heartbeat and restarts on crash / freeze | Critical |

Notes:

- **Screensaver ≠ sleep ≠ display off.** Disabling the screensaver alone will not keep a PC awake; use the sleep and display-off toggles too.
- Uninstall / restore paths try to reverse overlay and power backups where Setup saved them — do not assume every fleet image restores identically; re-check power settings after reimage.
- Game bar cannot be completely blocked because Win+G is handled by the Windows Xbox Gaming Overlay system component, rather than as a normal application keyboard shortcut. Therefore, the current workaround is to detect and close Game Bar immediately after Windows launches it.
- Group Policy / Intune / RMM policies on the machine can still override local hardening. For large fleets, align those rings with the same goals.

### Silent install mapping

```bat
TomorrowOS-Windows-Setup.exe /silent /cms "https://your-cms.example.com" /passcode "change-me" /orientation landscape /harden
```

| Flag | Hardening effect |
| --- | --- |
| `/harden` | Apply signage hardening defaults (display on, no sleep, no screensaver, Game Bar off, run hardening script) |
| `/keepdisplayoff` | With `/harden`, leave Windows “turn off display” alone |
| `/showcursor` | Do not hide the mouse cursor during playback |
| `/showtaskbar` | Do not hide the taskbar during playback |
| `/noautostart` | Skip login autostart registration |
| `/nowatchdog` | Do not start Watchdog after install |

### What hardening is not

- Not a full kiosk lockdown / Assigned Access replacement (use Windows kiosk / shell launcher policies separately if you need that)
- Not a CMS feature — settings live on the PC via Setup + `%ProgramData%\TomorrowOS\settings.json`
- Not a substitute for a maintenance passcode — technicians still use **Ctrl+Shift+Alt+M** + passcode to exit

## Supported baseline

V1 targets:

- Windows **11 Pro x64**
- WebView2 Evergreen Runtime
- Native Setup installer (interactive or silent)

Out of V1 scope unless separately certified:

- Windows 10
- Windows Home / S Mode
- ARM64

## Deploy checklist

1. Obtain `TomorrowOS-Windows-Setup.exe` (build from the Windows repo or your release channel)
2. Confirm the target PC is **Windows 11 Pro x64** with WebView2 Runtime
3. Install:
   - Interactive wizard, **or**
   - Silent flags with `/cms`, `/passcode`, `/orientation`, optional `/harden`
4. Confirm Watchdog starts at login and Player opens fullscreen on the chosen display
5. Confirm the player reaches pairing / brand idle
6. Pair with the 6-character code in the Control Panel
7. Publish a small image + video playlist and confirm playback
8. Test maintenance hotkey + passcode exit
9. Record **model + Windows edition/build + GPU** for certification notes

## Certification tests for Windows

Minimum tests per machine class:

- [ ] Install (interactive) completes and Watchdog autostarts
- [ ] Silent install with `/cms` + `/passcode` works
- [ ] Boot to player UI / brand idle / pairing
- [ ] CMS URL save rejects unreachable / invalid values (when using on-device setup)
- [ ] Pair with CMS (`platform` = `windows`)
- [ ] `device.info.get` returns model / serial / OS edition
- [ ] `device.info.getCapabilities` looks correct
- [ ] Image playlist playback
- [ ] Video playlist playback (H.264) in WebView2
- [ ] Image ↔ video transitions without black gaps
- [ ] Widget `.zip` / `.wgt` playback (if used)
- [ ] Offline / cached replay after disconnect
- [ ] Reboot + resume
- [ ] Screenshot capture
- [ ] On/off timer (quiet / black overlay)
- [ ] Portrait orientation (if used)
- [ ] Multi-monitor: correct `displayIndex` after reboot
- [ ] Maintenance hotkey + passcode exit
- [ ] Hardening keeps the appliance from sleeping / showing overlays (if applied)
- [ ] `/harden` silent install applies power + overlay settings as expected
- [ ] Developer / shared install leaves Windows usable (hardening off)

## Related docs

- `docs/api/overview.md` — command surface
- `docs/guides/black-gap-playback.md` — transition behaviour
- `docs/guides/widget-zip-packages.md` — widget zip handling
- `docs/guides/assets-and-atomic-activation.md` — media cache / publish flow
- Windows player repository `README.md` — build, silent flags, lab launch

## Goal

Document Windows as it behaves in real deployments: what TomorrowOS supports now on **Windows 11 Pro x64**, how Setup / Watchdog / WebView2 fit together, and which install + certification steps are production-ready.
