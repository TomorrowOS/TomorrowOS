---
name: Capability request
about: Request, document or challenge support for a TomorrowOS capability
title: "[Capability]: "
labels: capability
assignees: ""
---

# Capability Request

Use this template to request, document or challenge support for a TomorrowOS capability.

A capability is something an operating system, device, runtime or connector can safely support.

Examples:

```txt
playback.video.h264
transition.video_to_video
package.zip
asset.atomic_activation
display.power
telemetry.screenshot
proof.display
sync.wall
```

## Capability name

Enter the proposed capability name.

```txt

```

## Summary

Briefly explain the capability.

Example:

```txt
Support H.264 MP4 video playback on Samsung Tizen commercial displays.
```

## Capability area

Select the area that best matches this capability.

- [ ] Device
- [ ] Playback
- [ ] Image
- [ ] Video
- [ ] Transition
- [ ] Black-gap handling
- [ ] Package / ZIP
- [ ] Widget
- [ ] Asset handling
- [ ] Atomic activation
- [ ] Display control
- [ ] Network
- [ ] Synchronisation
- [ ] Telemetry
- [ ] Proof-of-play
- [ ] Proof-of-display
- [ ] Security
- [ ] Certification
- [ ] Other

## Proposed support status

Select the most accurate support status.

- [ ] `supported`
- [ ] `unsupported`
- [ ] `partial`
- [ ] `model-dependent`
- [ ] `firmware-dependent`
- [ ] `requires-bridge`
- [ ] `unsafe`
- [ ] `unknown`

## Operating system

Which operating system does this relate to?

- [ ] Samsung Tizen
- [ ] LG webOS
- [ ] BrightSign OS
- [ ] Android
- [ ] ChromeOS
- [ ] Windows
- [ ] Linux
- [ ] Browser runtime
- [ ] Other

Details:

```txt

```

## Device details

Please include as much detail as possible.

| Field | Details |
| --- | --- |
| Manufacturer |  |
| Model |  |
| Firmware version |  |
| OS version |  |
| Browser/runtime version |  |
| Player/app version |  |
| Connector or bridge used |  |

## Evidence

Describe how this capability was tested or verified.

Include:

- Test device
- Test firmware
- Test runtime
- Test content or command
- Test result
- Any logs or screenshots, if safe to share

```txt

```

## Expected behaviour

What should happen if this capability is supported?

```txt

```

## Actual behaviour

What actually happened during testing?

```txt

```

## Known limitations

List any limitations.

Examples:

- Only works on specific models
- Only works on specific firmware
- Requires native bridge
- Requires browser runtime
- Does not work offline
- Works only with certain file types
- Works but has timing issues
- Works but cannot be certified yet

```txt

```

## Fallback behaviour

What should TomorrowOS do if this capability is unavailable?

```txt

```

## Suggested API behaviour

If relevant, suggest how the API should behave.

Example:

```ts
const support = await tomorrow.capabilities.check("display.power")

if (support.status === "supported") {
  await tomorrow.display.power("off")
}
```

Suggested behaviour:

```txt

```

## Certification requirements

What should be tested before this capability is marked as supported?

```txt

```

## Security considerations

Does this capability introduce any security, privacy, device-control or customer-environment risk?

- [ ] Yes
- [ ] No
- [ ] Not sure

Explain:

```txt

```

## Additional notes

Add anything else that may help.

```txt

```

## Reminder

Do not mark a capability as `supported` unless it has been tested or evidenced.

If support is uncertain, use:

```txt
unknown
partial
model-dependent
firmware-dependent
requires-bridge
unsafe
```
