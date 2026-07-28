# Widget and ZIP Package Handling

TomorrowOS treats widgets and ZIP packages as playlist content, not as a separate package management API.

A widget can unlock rich signage experiences, but it can also create playback failures, black screens, missing assets and inconsistent behaviour across runtimes. This guide explains how widgets work in TomorrowOS **today**: how they appear in policy, how the player downloads and extracts packages, how they are shown, and what happens when they fail.

## Why package handling matters

Digital signage content is often more than a single image or video.

A package may include:

- HTML
- CSS
- JavaScript
- Fonts
- Images
- Videos
- JSON data
- Local assets

TomorrowOS does not expose `packages.validate` / `packages.install` / `packages.activate` commands.

Instead:

1. The CMS hosts a `.zip` / `.wgt` (or a remote HTML URL)
2. The playlist item points at that URL
3. The player prepares and shows the widget when that item plays

## Core principle

The core principle is:

> A widget is just another playlist item. Prepare it at play time. If it fails, fall back to brand idle.

There is no separate package install / activate / rollback surface in `@tomorrowos/sdk` yet.

## How widgets appear in policy

Widgets live inside `device.content.setPolicy` playlist items.

Typed playlist fields today:

```ts
{
  url: string
  type?: string
  durationMs?: number
  assetId?: string
}
```

Players also honour these optional fields when present:

| Field | Role |
| --- | --- |
| `url` | Package URL (`.zip` / `.wgt`) or remote HTML URL |
| `type` | Set to `"widget"` to force widget handling |
| `entryFile` | HTML entry inside the archive (default `index.html`) |
| `launchUrl` / `entryUrl` | Direct launch URL for non-package widgets |
| `version` | Cache key version (default `v1`) |
| `durationMs` | On-screen duration; widgets default to **20000** ms if omitted |

### Example: ZIP / WGT package

```ts
await tos.device(deviceId).sendCommand("device.content.setPolicy", {
  policy: {
    playlists: [
      {
        id: "lobby",
        name: "Lobby",
        items: [
          {
            url: "https://cms.example.com/media/weather-widget.zip",
            type: "widget",
            entryFile: "index.html",
            version: "1.2.0",
            durationMs: 30000
          }
        ]
      }
    ]
  }
})
```

If `type` is omitted, the player still treats `.zip` / `.wgt` URLs as widgets by extension.

### Example: hosted HTML widget (no ZIP)

```ts
{
  url: "https://cdn.example.com/widgets/clock/index.html",
  type: "widget",
  durationMs: 20000
}
```

Or with a separate launch URL:

```ts
{
  url: "https://cdn.example.com/widgets/clock/",
  type: "widget",
  launchUrl: "https://cdn.example.com/widgets/clock/index.html",
  durationMs: 20000
}
```

Without `type: "widget"`, a normal HTML URL is treated as `web` content. It still loads in an iframe, but it skips package download / extract / widget cache.

## Content type detection

The player resolves item type in this order:

1. Explicit `item.type` if present
2. Otherwise infer from the URL:
   - image extensions → `image`
   - video extensions → `video`
   - `.wgt` / `.zip` → `widget`
   - else → `web`

## Package lifecycle (as implemented)

For `.zip` / `.wgt` package URLs, the player does this at play time:

1. Resolve content type as `widget`
2. Check local widget cache (`url` + `version`)
3. If missing, download the archive into staging storage
4. Extract into a local widget folder
5. Find the entry HTML (`entryFile` or default `index.html`)
6. Remember the local entry path in `localStorage`
7. Mount the entry in an iframe
8. Fade-swap onto the visible content layer
9. Keep it on screen for `durationMs` (or 20s default)
10. On failure, stop and show brand idle

Important differences from an ideal “package manager”:

- No separate validate / install / activate commands
- No required package manifest
- No staged “ready but inactive” package registry
- No package-level rollback API
- Widgets are **not** prefetched by the image/video download queue; they are prepared when the item is about to play

## Entrypoint handling

Default entry file:

```txt
index.html
```

Override with playlist `entryFile`:

```json
{
  "url": "https://cms.example.com/media/menu.zip",
  "type": "widget",
  "entryFile": "app/index.html"
}
```

Before showing the widget, the player:

- Looks for `{extractDir}/{entryFile}`
- If missing, searches recursively for that filename (limited depth)
- Fails with an error if the entry file cannot be found

There is **no** manifest-driven entrypoint today. Put the HTML where `entryFile` expects it, or keep the default `index.html`.

## Caching

Widget packages use a local cache index keyed by:

```txt
${url}::${version || "v1"}
```

Behaviour:

- Cache hit → reuse local entry path if the file still exists
- Missing local file → drop that cache entry and download again
- Concurrent prepares for the same key are deduped

Changing `version` forces a fresh download / extract for the same URL.

## How widgets are shown

Widgets are shown in an **iframe** inside the player content layers.

- Local packages launch from a local file URL after extract
- Hosted HTML widgets launch from the remote URL
- Layer handoff uses a fade swap
- Stopping playback clears the active widget iframe

There is no separate native “widget runtime” API beyond the player’s HTML/iframe path.

## Failure handling

If prepare or mount fails, the player:

1. Logs the failure
2. Stops the current widget / playback path
3. Shows **brand idle** (not a previous-good package restore)

Common failure causes:

- Download URL is not absolute `http(s)`
- Archive download failed
- Archive extract failed
- Entry HTML not found
- Widget layer unavailable / playback cancelled mid-prepare
- Runtime / browser incompatibility inside the widget itself

There is currently no public event like `package.failure` and no `packages.rollback(...)` command.

## Offline behaviour

- Already-cached widget packages can still launch from local storage
- Uncached packages need network access to download
- Hosted HTML widgets that depend on remote assets may fail offline
- Image / video playlist prefetch does **not** warm widget packages ahead of time

If you need offline widgets, publish them early enough that the device has already played (and therefore cached) them at least once, or keep them as simple self-contained packages.

## Security reality

TomorrowOS currently focuses on getting widgets onto screen safely enough for signage use. Several stronger package-security controls are **not** shipped yet:

| Control | Current status |
| --- | --- |
| Manifest validation | Not implemented |
| Allowed file-type allowlist | Not enforced |
| Package size limits | Not enforced in the widget path |
| ZIP path-traversal rejection | Not enforced in the player extract path |
| iframe sandbox | Not applied |
| Permission declarations | Not implemented |
| Package rollback API | Not implemented |

Practical guidance for CMS builders:

- Only publish packages you trust
- Prefer self-contained packages with a clear `index.html`
- Avoid relying on unpackaged remote scripts when offline matters
- Use `version` when you intentionally replace package contents at the same URL

## Capability checks

There is no dedicated `package.zip` capability flag today.

Practical checks before relying on widgets:

1. Confirm the device can receive policy:

```ts
const caps = await tos.device(deviceId).sendCommand(
  "device.info.getCapabilities",
  {}
)

if (!caps.data.capabilities["device.content.setPolicy"]?.supported) {
  // cannot publish widget playlists to this device
}
```

2. Publish a small test widget playlist and verify it renders on the real device / firmware.

Widget support can still vary by OS, browser engine and firmware even when `setPolicy` itself is supported.

## API surface used for widgets

Widgets are published through the normal content policy path:

```ts
device.content.setPolicy
device.content.clear

tos.playlists.savePlaylist({ name, items, schedule })
tos.playlists.publishPlaylistsToDevice(deviceId, playlistIds)
```

Not available today:

```ts
tomorrow.packages.validate(...)
tomorrow.packages.install(...)
tomorrow.packages.activate(...)
tomorrow.packages.rollback(...)
tomorrow.packages.remove(...)
```

## BrightSign player zip vs content widget zip

Do not confuse these two:

| Package | Purpose |
| --- | --- |
| Content widget `.zip` / `.wgt` | Playlist media that the player extracts and shows in an iframe |
| BrightSign player zip (`/players/brightsign.zip`) | The TomorrowOS player app package used to install / update the player itself |

This guide is about **content widgets**, not the BrightSign player install zip.

## Practical checklist

Before shipping a widget to screens:

- [ ] Package has a clear entry HTML (`index.html` or explicit `entryFile`)
- [ ] Playlist item uses absolute `http(s)` URL
- [ ] `type: "widget"` is set when the URL is not obviously `.zip` / `.wgt`
- [ ] `durationMs` is set intentionally
- [ ] `version` is bumped when package bytes change at the same URL
- [ ] Widget is tested on the target OS / firmware
- [ ] Failure path is acceptable (brand idle, not a custom package rollback)

## Goal

TomorrowOS should make packaged signage content practical to deploy across supported runtimes.

Today that means:

- Publish widgets as playlist items
- Let the player download, extract, cache and iframe them
- Fall back to brand idle when preparation fails

The longer-term goal is stronger validation, safer extraction and clearer recovery. Until those APIs exist, treat widgets as trusted content you intentionally publish through `device.content.setPolicy`.
