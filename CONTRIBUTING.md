# Contributing to TomorrowOS

Thanks for helping build TomorrowOS.

TomorrowOS is an open source unified API layer for digital signage operating systems. The project needs input from people who understand how signage behaves in the real world: developers, integrators, CMS vendors, hardware specialists and end users.

## Ways to contribute

You can contribute by:

- Improving the unified API
- Adding OS capability mappings
- Reporting model or firmware-specific behaviour
- Adding certification test cases
- Improving documentation and examples
- Building connectors for signage operating systems
- Reporting playback, packaging, sync or device-control gaps

## Before opening a pull request

Please:

1. Search existing issues and discussions first
2. Keep changes focused
3. Explain the problem clearly
4. Include test notes where possible
5. Update documentation if the public API changes
6. Do not include secrets, private keys, customer data or proprietary SDK material

## Capability contributions

Capability mapping is one of the most important parts of TomorrowOS.

When adding or updating support for a feature, use one of these support levels:

| Status | Meaning |
| --- | --- |
| `supported` | Works through the standard TomorrowOS API |
| `unsupported` | Not available on this OS/device |
| `partial` | Works, but with known limits |
| `model-dependent` | Depends on the exact hardware model |
| `firmware-dependent` | Depends on firmware or OS version |
| `requires-bridge` | Requires an agent, native bridge or platform-specific layer |
| `unsafe` | Possible, but not recommended |
| `unknown` | Not yet tested |

## Evidence matters

If you mark a feature as supported, please include as much detail as possible:

- OS name
- Device model
- Firmware version
- Browser engine version, if relevant
- Test method
- Known limitations
- Fallback behaviour

Example:

```json
{
  "feature": "playback.video.h264",
  "os": "tizen",
  "status": "firmware-dependent",
  "testedModels": ["QM43C"],
  "testedFirmware": ["Tizen 7.0"],
  "notes": "Works in tested conditions. Codec and playback behaviour should still be validated per model.",
  "fallback": "Use fallback image if video preflight fails."
}
```

## Pull request checklist

Before submitting, please check:

- [ ] The change is clear and scoped
- [ ] Documentation has been updated where needed
- [ ] Capability claims include evidence where possible
- [ ] No secrets or customer data are included
- [ ] The change aligns with the goal of a clean unified API

## Project direction

TomorrowOS should remain:

- Simple for developers
- Honest about OS limitations
- Safe for device control
- Useful for real signage deployments
- Open enough for the industry to build on

## Contribution license

By contributing, you agree that your contribution may be released under the project license.
