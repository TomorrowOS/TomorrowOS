# Applications vs Widgets

TomorrowOS provides two approaches to building dynamic and interactive digital signage experiences: **Widgets** and **Applications**.

Widgets are content items managed through the existing TomorrowOS Player playlist system. Applications are complete signage experiences hosted by the developing TomorrowOS Application Runtime.

Both allow developers to create custom HTML-based experiences, but they have different purposes, lifecycles, packaging models and API interfaces.

This guide explains the differences and helps you decide which approach is right for your project.

> **Current status**
>
> Widgets are supported through the existing TomorrowOS Player architecture, subject to platform and firmware compatibility.
>
> The TomorrowOS Application Runtime is currently a developer preview. Application loading, manifest handling and HTML5 APIs are implemented in the Runtime repository, but compatible host integrations and production certification are required.

---

## At a Glance

| Feature | Widgets | Applications |
|---|---|---|
| Primary purpose | Dynamic content within a playlist | Complete signage applications |
| Lifecycle | Controlled by playlist playback | Controlled by the Application Runtime |
| Packaging | Hosted HTML, ZIP or WGT | Manifest-based ZIP or WGT application package |
| Entry point | `index.html` or configured `entryFile` | Application manifest `entry` |
| Deployment | Published through a CMS content policy | Loaded by the Application Shell |
| Updates | Content URL and version-based caching | Manifest version and application update management |
| SDK | Existing CMS/Player content policy model | TomorrowOS HTML5 Runtime SDK |
| Device access | Existing Player capabilities and behaviour | Supported APIs exposed by the Runtime host |
| CMS integration | Through the TomorrowOS Server SDK | Through the application's own logic and Runtime interfaces |
| Offline behaviour | Cached widget packages can be reused | Installed application packages can be reused |
| Recovery | Existing Player fallback behaviour | Application recovery and rollback mechanisms |
| Status | Existing Player feature | Developer preview |

**Simple rule:**

- Use a **Widget** when you want to display dynamic content inside an existing signage playlist.
- Use an **Application** when you want to build or operate a complete signage experience.

---

## 1. What Is a Widget?

A Widget is an HTML-based content item that plays within a TomorrowOS playlist.

Widgets can contain:

- HTML
- CSS
- JavaScript
- Images and video
- Animations
- Data from external APIs
- Locally packaged assets

Typical examples include:

- Weather and information displays
- Digital clocks
- Queue and order status displays
- Live dashboards
- Restaurant promotional content
- Custom HTML animations
- API-driven information panels

A Widget is not a standalone application managed by the new Application Runtime.

It is a content item published and controlled by the existing TomorrowOS Player.

### How Widgets Work

```text
Your CMS
   |
   v
TomorrowOS Server SDK
   |
   v
Content Policy / Playlist
   |
   v
TomorrowOS Player
   |
   v
Widget (HTML / ZIP / WGT)
   |
   v
Display
```

The CMS determines which widget should play, when it should play and how long it remains visible.

The Player handles the widget according to the content policy.

### Widget Example

A CMS can publish a widget using the standard content policy API:

```javascript
await tos.device(deviceId).sendCommand(
  "device.content.setPolicy",
  {
    policy: {
      playlists: [
        {
          id: "lobby",
          name: "Lobby",
          items: [
            {
              type: "widget",
              url: "https://example.com/widgets/clock.zip",
              entryFile: "index.html",
              version: "1.0.0",
              durationMs: 30000
            }
          ]
        }
      ]
    }
  }
);
```

In this example:

- The widget is downloaded from the specified URL.
- The Player extracts the package where required.
- The Player locates the entry HTML.
- The widget is displayed as a playlist item.
- Playback duration is controlled by `durationMs`.

Widgets can be cached locally and reused when the appropriate files are available.

### When Should I Use a Widget?

Use a Widget when:

- You already have a CMS controlling playlists.
- You want to add dynamic content to existing signage.
- Your experience only needs to occupy part of the playlist.
- You don't need to replace the entire signage application.
- You want to distribute reusable HTML content.

**Example:** A restaurant wants to display a live order status panel as part of its normal signage experience.

The order status experience can be implemented as a widget, provided the target Player supports the required behaviour.

[Read the Widget and ZIP Package Guide](./widget-zip-packages.md)

---

## 2. What Is an Application?

An Application is a complete HTML-based signage experience designed to run inside the TomorrowOS Application Runtime.

Unlike a Widget, an Application is not inherently controlled by a playlist.

It can provide its own:

- User interface
- Content management logic
- Playback logic
- CMS connection
- Application-specific workflows
- Data integrations
- Scheduling behaviour
- Interactive experiences

Applications communicate with the underlying hardware through the TomorrowOS HTML5 SDK and supported host interfaces.

The goal is to make it easier for developers to build custom signage products without implementing every device integration independently.

### How Applications Work

```text
Your Application
   |
   v
TomorrowOS HTML5 SDK
   |
   v
TomorrowOS Application Shell
   |
   v
Platform-Specific Host
   |
   v
Device Hardware
```

The Application is responsible for its own functionality.

The Shell handles application loading and provides access to supported runtime services.

Platform-specific hosts implement the available device functionality.

### Application Example

A developer could build a complete restaurant menu board application containing:

- Product information
- Prices
- Promotional campaigns
- Dynamic availability
- External data integrations
- Custom layouts
- Playback and content logic

The application could communicate with a CMS or other data source while using the TomorrowOS Runtime interfaces for supported device operations.

### Application Manifest

Applications use a manifest to describe the package and its entry point.

Example `manifest.json`:

```json
{
  "appId": "restaurant-menu",
  "version": "1.0.0",
  "packageUrl": "https://example.com/apps/restaurant-menu.zip",
  "entry": "index.html"
}
```

The current manifest parser recognises:

| Field | Purpose |
|---|---|
| `appId` | Application identifier |
| `version` | Application version |
| `packageUrl` | Application package location |
| `entry` | HTML entry point, defaulting to `index.html` |

The Application Shell uses this information to retrieve and load the application through a compatible host.

### HTML5 SDK Example

The Application Runtime includes a JavaScript SDK.

Applications can query device information:

```javascript
const info = await TomorrowOS.getInfo();

console.log(info);
```

Discover available capabilities:

```javascript
const capabilities =
  await TomorrowOS.getCapabilities();

console.log(capabilities);
```

Applications can also access supported playback, device, storage, input and CMS communication interfaces.

These methods require a compatible TomorrowOS host and do not guarantee the same hardware capabilities on every device.

### When Should I Use an Application?

Use an Application when:

- You are building your own signage product.
- You want complete control over the displayed experience.
- You need application-specific CMS integration.
- You want to implement your own playback or content workflows.
- You are creating a custom digital signage solution.
- You want to target the developing TomorrowOS Runtime API model.

**Example:** A software company wants to build its own digital signage CMS and player experience without maintaining separate native hardware integrations wherever compatible TomorrowOS hosts become available.

[Explore the TomorrowOS Application Runtime](https://github.com/TomorrowOS/TomorrowOS-Runtime)

---

## 3. Application Lifecycle vs Widget Lifecycle

### Widget Lifecycle

Widgets are controlled through the existing Player content policy.

```text
CMS publishes playlist
       |
       v
Player receives policy
       |
       v
Widget is prepared
       |
       v
Widget plays
       |
       v
Playlist continues
```

Key characteristics:

- Widgets are playlist content.
- Widget playback follows the content policy.
- Packaged widgets use URL and version-based caching.
- Cached packages may be available offline.
- A widget preparation or playback failure can result in brand idle fallback.
- There is no standalone widget package rollback API in the existing Player model.

### Application Lifecycle

Applications use the emerging Application Runtime.

```text
Application source configured
       |
       v
Manifest retrieved
       |
       v
Version checked
       |
       v
Package installed
       |
       v
Application loaded
       |
       v
Application runs
```

Key characteristics:

- Applications are loaded by the Shell.
- The manifest defines application version and entry point.
- The Runtime includes update-management logic.
- Installed application packages can be reused when network access is unavailable.
- Previous installed versions may be used during recovery.
- The application determines its own internal content experience.

The current Runtime implements these mechanisms, but complete behaviour depends on the platform host and requires hardware validation.

---

## 4. Device and Hardware Access

Both approaches operate within the capabilities of their underlying Player or Runtime.

However, their interfaces differ.

### Widgets

Widgets run within the existing Player content environment.

The CMS can use supported Player commands such as:

```text
device.info.get
device.info.getCapabilities
device.content.setPolicy
device.content.clear
device.power.reboot
device.display.setOnOffTimer
device.telemetry.captureScreen
```

These are Player/CMS commands.

They are not automatically available as direct JavaScript APIs inside every widget.

### Applications

Applications can use the HTML5 Runtime SDK.

Examples include:

```javascript
TomorrowOS.getInfo()
TomorrowOS.getCapabilities()
TomorrowOS.play(url)
TomorrowOS.stop()
TomorrowOS.getPlaybackState()
TomorrowOS.captureScreen()
TomorrowOS.reboot()
TomorrowOS.getOrientation()
TomorrowOS.connectCms(cmsEndpoint)
TomorrowOS.getPairingState()
```

Additional APIs cover file operations, application command handlers, input events and runtime context.

**Important:** API presence does not guarantee that the hardware supports the requested operation.

Developers must check available capabilities and handle unsupported functionality gracefully.

---

## 5. Can Applications Contain Widgets?

Yes, as an application design pattern.

For example, a developer could create an application containing:

- A digital menu board
- A promotional section
- A live order information section
- A clock
- A weather information area

These components could be implemented using HTML, CSS and JavaScript within the application.

However, this does not mean the existing TomorrowOS playlist widget package format is automatically supported as an independently installable component inside every Application Runtime host.

The current Application Runtime is designed around loading complete applications.

A general-purpose nested widget framework, including independently managed widget packages, should be treated as a separate capability requiring implementation and validation.

---

## 6. Which Should You Choose?

| Your Goal | Recommended Approach |
|---|---|
| Add a clock to an existing signage playlist | Widget |
| Display a live information panel within a playlist | Widget |
| Package reusable HTML content for a CMS | Widget |
| Create a complete digital signage player experience | Application |
| Build a custom CMS-connected signage product | Application |
| Develop a dedicated interactive signage experience | Application |
| Implement your own application workflows | Application |
| Build reusable components inside your own application | Application components |

If you're starting with an existing TomorrowOS Player deployment, widgets provide the established playlist-content approach.

If you're developing a complete new signage experience, explore the Application Runtime architecture while accounting for its developer-preview status.

---

## 7. Compatibility and Limitations

The existing TomorrowOS Player and the newer Application Runtime are different deployment architectures.

Current TomorrowOS Player platform documentation includes:

- Samsung Tizen 6.5 and 7.0
- BrightSign Series 3–6
- Windows 11 Pro x64

Support remains dependent on tested hardware and firmware.

**Existing Player support does not automatically establish Application Runtime compatibility on those platforms.**

The Application Runtime requires a compatible platform-specific host.

Android-based hardware integration and broader platform expansion remain subject to development and certification.

Before deploying, verify:

1. Hardware manufacturer and model
2. Operating system and firmware
3. Player or Application Runtime version
4. Supported capabilities
5. Media and playback requirements
6. Offline and recovery behaviour
7. Security and deployment configuration

[View the TomorrowOS Certification Guide](../testing/certification.md)

---

## 8. Security Considerations

Widgets and Applications both execute HTML and JavaScript, but they have different deployment and trust boundaries.

The existing widget path does not currently provide all the package validation, sandboxing and rollback controls expected from a general-purpose untrusted application platform.

The Application Runtime includes manifest validation and application lifecycle mechanisms, but additional validation is required for package authenticity, message origin handling, device API access and other third-party application security boundaries.

Developers should:

- Use trusted application and widget packages.
- Validate external data.
- Avoid embedding credentials or secrets in client-side code.
- Test on target hardware.
- Restrict access to sensitive device operations.
- Review compatibility before production deployment.

Do not assume arbitrary third-party code is safe to run.

[Read the TomorrowOS Security Policy](../../SECURITY.md)

---

## 9. Developer Resources

| Resource | Description |
|---|---|
| [TomorrowOS Main Repository](https://github.com/TomorrowOS/TomorrowOS) | Project overview and documentation |
| [TomorrowOS Server SDK](https://github.com/TomorrowOS/TomorrowOS_SDK) | Build your own CMS and connect screens |
| [TomorrowOS Application Runtime](https://github.com/TomorrowOS/TomorrowOS-Runtime) | Application Shell and HTML5 SDK |
| [Widget and ZIP Package Guide](./widget-zip-packages.md) | Existing Player widget implementation |
| [Platform Compatibility and Certification](../testing/certification.md) | Hardware testing and certification requirements |
| [Security Policy](../../SECURITY.md) | Security reporting and guidance |
| [GitHub Discussions](https://github.com/TomorrowOS/TomorrowOS/discussions) | Questions, ideas and community feedback |

---

## Building on TomorrowOS

TomorrowOS is being developed as an open foundation for digital signage software.

Our goal is to make it easier for developers, CMS providers, integrators and hardware manufacturers to build compatible signage experiences without repeatedly solving the same underlying hardware challenges.

Widgets make it possible to extend existing signage playlists.

Applications provide the foundation for building complete custom signage experiences.

**Build what you want. Keep control of your product. Help shape an open digital signage ecosystem.**
