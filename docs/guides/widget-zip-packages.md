# Widget and ZIP Package Handling

TomorrowOS should treat widgets and ZIP packages as powerful, but high-risk.

A widget or package can unlock rich signage experiences, but it can also create playback failures, black screens, missing assets, broken layouts, security risks and inconsistent behaviour across operating systems.

This guide explains how TomorrowOS should validate, install, activate and recover from packaged content.

## Why package handling matters

Digital signage content is often delivered as more than a single image or video.

A package may include:

- HTML
- CSS
- JavaScript
- Fonts
- Images
- Videos
- JSON data
- Configuration files
- Local assets
- External API calls
- A manifest file
- A fallback image

Different operating systems and runtimes may handle packages differently.

That means TomorrowOS needs a consistent way to validate and run packages safely.

## Core principle

The core principle is:

> Treat every package as untrusted until it has been validated.

A package should never be activated on screen just because it downloaded successfully.

It should first be checked, staged, tested and only then activated.

## Package lifecycle

A safe package lifecycle should follow this flow:

1. Receive package
2. Validate file type
3. Validate package size
4. Extract safely into staging
5. Check for unsafe file paths
6. Validate manifest
7. Confirm entrypoint exists
8. Confirm required assets exist
9. Check permissions
10. Preload package
11. Confirm it can render
12. Activate package
13. Monitor runtime errors
14. Fall back if it fails
15. Roll back if needed

## Example manifest

A TomorrowOS widget package should include a manifest.

Example:

```json
{
  "name": "weather-widget",
  "version": "1.0.0",
  "entrypoint": "index.html",
  "type": "widget",
  "permissions": ["network"],
  "assets": [
    "index.html",
    "main.js",
    "style.css",
    "fallback.jpg"
  ],
  "fallback": "fallback.jpg",
  "timeoutMs": 5000
}
```

## Required manifest fields

| Field | Purpose |
| --- | --- |
| `name` | Package name |
| `version` | Package version |
| `entrypoint` | Main file to load |
| `type` | Package type, such as `widget` or `app` |
| `assets` | Files expected inside the package |
| `fallback` | Local fallback content |
| `timeoutMs` | Maximum time to wait before fallback |

## Optional manifest fields

| Field | Purpose |
| --- | --- |
| `permissions` | Required permissions such as network access |
| `screenOrientation` | Preferred orientation |
| `minRuntimeVersion` | Minimum TomorrowOS runtime version |
| `minWidth` | Minimum supported width |
| `minHeight` | Minimum supported height |
| `maxStorageMb` | Maximum storage expected |
| `requiresNetwork` | Whether package requires live network access |
| `supportsOffline` | Whether package can run offline |
| `proofEnabled` | Whether proof events should be recorded |

## Package validation

Package validation should check:

- File is present
- File extension is allowed
- File is a valid ZIP where applicable
- Package size is within limits
- Manifest exists
- Manifest is valid JSON
- Required manifest fields exist
- Entrypoint exists
- Fallback exists
- Assets listed in manifest exist
- No unsafe paths exist
- No files attempt to extract outside package directory
- File types are allowed
- Permissions are declared
- Runtime requirements are compatible

Example:

```ts
const result = await tomorrow.packages.validate("/packages/weather-widget.zip")

if (result.ok) {
  await tomorrow.packages.install("/packages/weather-widget.zip")
} else {
  await tomorrow.playback.restoreLastKnownGood()
}
```

## Unsafe path protection

ZIP packages must be protected against unsafe extraction paths.

Examples of unsafe paths:

```txt
../config.json
../../system/file
/assets/../../secrets.txt
C:\\Windows\\system32\\file
```

TomorrowOS should reject packages that attempt to write outside the approved package directory.

## File type rules

TomorrowOS should define allowed file types.

Common allowed types may include:

```txt
.html
.css
.js
.json
.jpg
.jpeg
.png
.webp
.svg
.mp4
.webm
.woff
.woff2
.ttf
```

Potentially risky or unsupported file types should be blocked unless explicitly allowed.

Examples:

```txt
.exe
.bat
.sh
.command
.dll
.dylib
.so
.php
.py
.rb
```

## Entrypoint handling

The entrypoint is the first file loaded by the runtime.

Example:

```json
{
  "entrypoint": "index.html"
}
```

Before activation, TomorrowOS should confirm:

- The entrypoint exists
- The entrypoint is inside the package
- The entrypoint is an allowed file type
- The entrypoint can be loaded
- Required local assets can be found
- A fallback exists if loading fails

## Package staging

Packages should be staged before activation.

Staging means:

- The package has been downloaded
- The package has been extracted safely
- The manifest has been validated
- The entrypoint has been checked
- Required assets are present
- Capability checks have passed
- Fallback content exists

A staged package is not necessarily active yet.

## Package activation

A package should only be activated after validation and staging.

Example:

```ts
const installed = await tomorrow.packages.install("/packages/weather-widget.zip")

await tomorrow.packages.activate(installed.packageId, {
  mode: "atomic",
  fallback: "last-known-good"
})
```

## Atomic activation

Package activation should be atomic where possible.

This means the screen should not switch to the new package until TomorrowOS knows the package can start safely.

A package should not activate if:

- Manifest validation fails
- Entrypoint is missing
- Fallback is missing
- Required assets are missing
- Runtime capability is unsupported
- Package extraction failed
- Package exceeds storage limits
- The device is under memory pressure

## Widget timeout handling

Widgets should not be allowed to hold the screen hostage.

TomorrowOS should support timeout rules.

Example:

```ts
await tomorrow.playback.play({
  type: "widget",
  packageId: "weather-widget",
  timeoutMs: 5000,
  fallback: "/assets/fallback.jpg"
})
```

If the widget does not load within the timeout, TomorrowOS should:

1. Stop the widget
2. Use fallback content
3. Log the failure
4. Report telemetry
5. Keep last known good content available

## Widget crash handling

Widgets may fail after activation.

Common causes include:

- JavaScript errors
- Network failures
- Missing assets
- Font loading issues
- API timeouts
- Memory pressure
- Browser engine incompatibility
- Unsupported CSS or JavaScript features

TomorrowOS should detect and report widget failures where possible.

Example failure event:

```json
{
  "type": "package.failure",
  "packageId": "weather-widget",
  "reason": "widget_runtime_error",
  "message": "Required asset failed to load",
  "fallbackUsed": true,
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

## Package rollback

If a package fails, TomorrowOS should support rollback.

Rollback may return to:

- Last known good package
- Last known good playlist
- Default fallback image
- Emergency fallback content

Example:

```ts
await tomorrow.packages.rollback("weather-widget")
```

Rollback should be logged and reported.

## Offline behaviour

Packages should declare whether they support offline playback.

Example:

```json
{
  "supportsOffline": true,
  "requiresNetwork": false
}
```

If a package requires network access and the device is offline, TomorrowOS should avoid activating it unless a fallback exists.

## Permissions

Packages should declare permissions clearly.

Example:

```json
{
  "permissions": ["network", "storage"]
}
```

Potential permissions may include:

```txt
network
storage
proof
telemetry
display
device
sync
```

TomorrowOS should avoid giving packages unnecessary access.

## Security risks

Package handling should protect against:

- Path traversal
- Unsafe extraction
- Untrusted scripts
- Oversized packages
- Missing fallback content
- External dependency failure
- Secret leakage through logs
- Uncontrolled network calls
- Runtime crashes
- Unauthenticated device access
- Customer data exposure

## Capability checks

Before running a package, TomorrowOS should check relevant capabilities.

Examples:

```txt
package.zip
package.manifest
package.safe_extraction
package.rollback
playback.widget
playback.widget.entrypoint
playback.widget.timeout
playback.widget.local_assets
playback.widget.external_network
security.package_validation
asset.atomic_activation
```

## API examples

Validate package:

```ts
const validation = await tomorrow.packages.validate("/packages/menu-widget.zip")
```

Install package:

```ts
const installed = await tomorrow.packages.install("/packages/menu-widget.zip")
```

Activate package:

```ts
await tomorrow.packages.activate(installed.packageId, {
  mode: "atomic",
  fallback: "/assets/fallback.jpg"
})
```

Rollback package:

```ts
await tomorrow.packages.rollback(installed.packageId)
```

Remove package:

```ts
await tomorrow.packages.remove(installed.packageId)
```

## Certification tests

Every OS, model and firmware combination should be tested for package behaviour.

Minimum tests:

- Valid ZIP package
- Invalid ZIP package
- Missing manifest
- Invalid manifest JSON
- Missing entrypoint
- Missing fallback
- Unsafe path traversal attempt
- Oversized package
- Unsupported file type
- Widget timeout
- Widget runtime error
- Offline package behaviour
- Rollback after failed package
- Atomic activation
- Package removal

## Goal

TomorrowOS should make packaged signage content safer, more predictable and easier to deploy.

The goal is not just to support ZIP files.

The goal is to make sure packaged content can be validated, trusted, activated and recovered from across different signage operating systems.
