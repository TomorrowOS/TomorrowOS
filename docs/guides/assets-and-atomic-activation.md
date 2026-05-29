# Asset Download, Cache and Atomic Activation

TomorrowOS should make sure content is fully downloaded, verified and ready before it ever appears on screen.

In digital signage, a screen should never switch to broken, partial, missing or corrupt content.

This guide explains how TomorrowOS should manage assets, caching, verification, fallback behaviour and atomic activation.

## Why asset handling matters

A signage screen may need to play:

- Images
- Videos
- HTML files
- Widget files
- Fonts
- JSON data
- Package assets
- Playlist assets
- Fallback content
- Emergency content

If these assets are not handled properly, screens can show:

- Black screens
- Broken images
- Frozen video
- Missing fonts
- Half-loaded widgets
- Outdated content
- Incomplete playlists
- Failed schedules
- Incorrect proof-of-play events

TomorrowOS should prevent this by treating asset handling as a core part of the playback system.

## Core principle

The core principle is:

> Download first. Verify second. Stage third. Activate last.

Content should not become active just because a CMS or server says it is ready.

The device should confirm that all required assets are available locally, valid and safe to display before switching playback.

## Asset lifecycle

A safe asset lifecycle should follow this flow:

1. Receive asset instruction
2. Check device capability
3. Check storage availability
4. Download asset
5. Verify file exists
6. Validate file type
7. Validate checksum where available
8. Confirm file size
9. Confirm file is not partial or corrupt
10. Stage asset locally
11. Confirm fallback content exists
12. Activate asset or playlist atomically
13. Report success or failure
14. Clean up expired assets when safe

## Asset record example

```json
{
  "id": "promo_video_001",
  "type": "video",
  "src": "https://example.com/assets/promo.mp4",
  "filename": "promo.mp4",
  "checksum": "sha256-example",
  "sizeBytes": 24500000,
  "durationMs": 15000,
  "fallback": "fallback_image_001",
  "expiresAt": "2026-01-01T10:00:00.000Z"
}
```

## Asset types

TomorrowOS should support asset handling for:

| Type | Example |
| --- | --- |
| Image | JPG, PNG, WebP, SVG |
| Video | MP4, WebM |
| HTML | Local HTML file |
| Widget | Packaged HTML/CSS/JS |
| Font | WOFF, WOFF2, TTF |
| Data | JSON, CSV |
| Package | ZIP or widget package |
| Fallback | Local safe image or playlist |

## Asset download

Downloads should be resilient.

TomorrowOS should account for:

- Slow networks
- Interrupted downloads
- Partial downloads
- Expired URLs
- DNS failures
- Captive portals
- Storage limits
- Retry limits
- File size mismatch
- Checksum mismatch
- Unsupported file types

Example:

```ts
const download = await tomorrow.assets.download({
  id: "promo_video_001",
  src: "https://example.com/assets/promo.mp4",
  checksum: "sha256-example",
  sizeBytes: 24500000
})
```

## Download status

Asset download status should be clear.

Possible statuses:

```txt
queued
downloading
downloaded
verified
staged
active
failed
expired
removed
```

Example response:

```json
{
  "assetId": "promo_video_001",
  "status": "verified",
  "localPath": "/storage/assets/promo.mp4",
  "checksumValid": true,
  "sizeBytes": 24500000
}
```

## Checksum validation

Checksum validation helps confirm that an asset has downloaded correctly.

TomorrowOS should support checksum validation where a checksum is provided.

Example:

```ts
const verified = await tomorrow.assets.verify("promo_video_001")
```

Expected response:

```json
{
  "assetId": "promo_video_001",
  "ok": true,
  "checksumValid": true,
  "fileExists": true,
  "partialDownload": false
}
```

If checksum validation fails, TomorrowOS should not activate the asset.

## Partial download detection

TomorrowOS should detect partial downloads before playback.

Partial downloads may happen because of:

- Network dropouts
- Power loss
- Storage pressure
- Timeout
- Server interruption
- Expired signed URLs

A partially downloaded file should never be marked as ready.

Example failure event:

```json
{
  "type": "asset.failure",
  "assetId": "promo_video_001",
  "reason": "asset_partial_download",
  "fallbackUsed": true,
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

## Local cache

TomorrowOS should support local caching so screens can keep playing when offline.

The cache should track:

- Asset ID
- Local path
- File type
- Size
- Checksum
- Last used time
- Expiry time
- Playlist references
- Package references
- Active or inactive state

Example:

```ts
const storage = await tomorrow.assets.getStorage()
```

Expected response:

```json
{
  "totalBytes": 8000000000,
  "usedBytes": 3200000000,
  "availableBytes": 4800000000,
  "assetCount": 128,
  "storagePressure": false
}
```

## Storage pressure

Storage pressure can cause playback and update failures.

TomorrowOS should detect when storage is low and avoid risky activations.

Storage pressure should trigger:

- Cleanup of expired assets
- Removal of unused assets
- Warning telemetry
- Blocking of large new downloads if unsafe
- Fallback to last known good content if needed

Example capability or status:

```txt
asset.storage.available
asset.storage.pressure
asset.cleanup.expired
```

## Asset expiry

Assets may expire when they are no longer needed.

TomorrowOS should support expiry rules.

Example:

```json
{
  "assetId": "summer_menu_image",
  "expiresAt": "2026-02-01T00:00:00.000Z",
  "removeWhenUnused": true
}
```

Expired assets should not be removed if they are still part of the active playlist or last known good fallback.

## Staging

Staging means the asset is ready locally but not yet active.

An asset should be staged only after:

- Download completed
- File exists
- Checksum passed, if provided
- File type is allowed
- Storage is safe
- Required capability is available
- Fallback content exists

Example:

```ts
await tomorrow.assets.stage("promo_video_001")
```

## Atomic activation

Atomic activation means content switches only when the full set of required assets is ready.

This is critical for playlists, widgets and scheduled updates.

A playlist should not activate if:

- One or more assets are missing
- One or more assets failed verification
- A widget package failed validation
- A fallback asset is missing
- Storage is too low
- Device capability checks fail
- Schedule rules are invalid
- Required package permissions are unavailable

Example:

```ts
const result = await tomorrow.playback.activatePlaylist("lunch_menu", {
  mode: "atomic",
  fallback: "last-known-good"
})
```

## Atomic playlist activation flow

A safe playlist activation flow should be:

1. Receive new playlist
2. Identify all required assets
3. Check capabilities for each content type
4. Download all missing assets
5. Verify all assets
6. Stage all assets
7. Validate schedule and zone rules
8. Confirm fallback exists
9. Activate playlist in one clean switch
10. Report activation success or failure

## Last known good content

TomorrowOS should always maintain last known good content.

This may include:

- Last known good image
- Last known good video
- Last known good playlist
- Last known good package
- Default fallback image
- Emergency fallback content

Example:

```ts
await tomorrow.playback.restoreLastKnownGood()
```

Last known good content should not be deleted during cache cleanup.

## Fallback handling

Fallback content should be local, simple and reliable.

Fallback content may be used when:

- Download fails
- Checksum fails
- Asset is missing
- Codec is unsupported
- Widget fails
- Package fails
- Playlist activation fails
- Network is offline
- Storage is too low
- Runtime crashes

Example:

```ts
await tomorrow.playback.play({
  type: "image",
  src: "/assets/fallback.jpg"
})
```

## Asset cleanup

Asset cleanup should be safe.

TomorrowOS should avoid deleting:

- Currently active assets
- Assets in the active playlist
- Last known good assets
- Emergency fallback content
- Assets still referenced by installed packages

Cleanup may remove:

- Expired assets
- Unused assets
- Failed downloads
- Old package versions
- Temporary staging files

Example:

```ts
await tomorrow.assets.cleanup({
  removeExpired: true,
  removeFailedDownloads: true,
  preserveLastKnownGood: true
})
```

## Offline behaviour

Screens should continue playing when offline.

TomorrowOS should support:

- Offline asset playback
- Cached playlist playback
- Cached widget playback where possible
- Retry downloads when reconnected
- Avoid activation of incomplete updates
- Report offline state when connection returns

Example:

```ts
tomorrow.network.onOffline(async () => {
  await tomorrow.playback.continueCached()
})
```

## Failure reasons

Common asset failure reasons may include:

```txt
asset_missing
asset_download_failed
asset_partial_download
asset_checksum_failed
asset_type_unsupported
asset_size_mismatch
asset_storage_full
asset_expired
asset_permission_denied
asset_activation_failed
playlist_asset_missing
fallback_missing
```

## Telemetry events

Asset events should be reported clearly.

Example:

```json
{
  "type": "asset.download.completed",
  "assetId": "promo_video_001",
  "sizeBytes": 24500000,
  "checksumValid": true,
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

Failure example:

```json
{
  "type": "asset.activation.failed",
  "assetId": "promo_video_001",
  "reason": "asset_checksum_failed",
  "fallbackUsed": true,
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

## Capability checks

Relevant capability checks may include:

```txt
asset.download
asset.checksum
asset.stage
asset.atomic_activation
asset.cleanup
asset.expiry
asset.storage.available
asset.storage.pressure
asset.partial_download_detection
playback.restore_last_known_good
network.offline_cache
```

## API examples

Download asset:

```ts
await tomorrow.assets.download({
  id: "promo_video_001",
  src: "https://example.com/promo.mp4",
  checksum: "sha256-example"
})
```

Verify asset:

```ts
await tomorrow.assets.verify("promo_video_001")
```

Stage asset:

```ts
await tomorrow.assets.stage("promo_video_001")
```

Activate asset:

```ts
await tomorrow.assets.activate("promo_video_001")
```

Check storage:

```ts
await tomorrow.assets.getStorage()
```

Clean up cache:

```ts
await tomorrow.assets.cleanup({
  preserveLastKnownGood: true
})
```

## Certification tests

Every OS, model and firmware combination should be tested for asset handling.

Minimum tests:

- Successful image download
- Successful video download
- Failed download
- Interrupted download
- Partial download rejection
- Checksum success
- Checksum failure
- Unsupported file type
- Storage full handling
- Asset expiry
- Cache cleanup
- Offline cached playback
- Atomic playlist activation
- Activation failure rollback
- Last known good recovery
- Missing fallback handling

## Goal

TomorrowOS should make content activation safe and predictable.

The goal is not just to download files.

The goal is to make sure the right content is fully ready, verified, staged and safely activated before the screen changes.
