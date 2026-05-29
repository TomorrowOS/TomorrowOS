---
name: Feature request
about: Suggest a new TomorrowOS feature, API or improvement
title: "[Feature]: "
labels: enhancement
assignees: ""
---

# Feature Request

Use this template to suggest a new TomorrowOS feature, API, connector, guide, example or improvement.

## Summary

Briefly describe the feature.

Example:

```txt
Add a unified API for detecting whether a device can safely capture screenshots.
```

## Problem

What problem does this feature solve?

```txt

```

## Why this matters

Explain why this matters for real signage deployments.

Consider:

- Playback reliability
- OS compatibility
- Device control
- Package handling
- Asset activation
- Sync
- Telemetry
- Proof-of-play
- Security
- Developer experience
- Integrator experience
- Customer experience

```txt

```

## Proposed solution

Describe the proposed solution.

```txt

```

## Suggested API

If this is an API feature, suggest what the API could look like.

Example:

```ts
const support = await tomorrow.capabilities.check("telemetry.screenshot")

if (support.status === "supported") {
  const screenshot = await tomorrow.telemetry.screenshot()
}
```

Suggested API:

```ts

```

## Affected area

Select the area that best matches this feature.

- [ ] Device API
- [ ] Capability API
- [ ] Playback API
- [ ] Transition API
- [ ] Package API
- [ ] Asset API
- [ ] Sync API
- [ ] Display API
- [ ] Network API
- [ ] Telemetry API
- [ ] Proof API
- [ ] Security API
- [ ] Certification API
- [ ] Documentation
- [ ] Examples
- [ ] Tooling
- [ ] Other

## Related capabilities

List any related capability names.

Examples:

```txt
display.power
telemetry.screenshot
package.zip
asset.atomic_activation
proof.display
sync.wall
```

Related capabilities:

```txt

```

## Target operating systems

Which operating systems or runtimes should this feature consider?

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

## Support complexity

How complex do you think this feature is?

- [ ] Simple
- [ ] Moderate
- [ ] Complex
- [ ] Requires bridge or agent
- [ ] OS-specific
- [ ] Model-dependent
- [ ] Firmware-dependent
- [ ] Not sure

Explain:

```txt

```

## Security considerations

Could this feature create any security, privacy or device-control risk?

- [ ] Yes
- [ ] No
- [ ] Not sure

Explain:

```txt

```

## Fallback behaviour

What should happen if the feature is not supported on a device?

```txt

```

## Alternatives considered

Have you considered another way to solve this?

```txt

```

## Certification requirements

What should be tested before this feature is considered supported?

```txt

```

## Additional context

Add any extra context, screenshots, links, examples or notes.

Please do not include secrets, credentials, access tokens, customer data or private deployment information.

```txt

```
