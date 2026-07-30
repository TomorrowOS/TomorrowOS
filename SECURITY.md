---
title: "Security"
sidebarTitle: "Security"
---

# Security Policy

TomorrowOS is an open source unified API layer for digital signage operating systems.

Because TomorrowOS may interact with device APIs, playback surfaces, local networks, content packages, telemetry, screenshots and remote-control functions, security is treated as a core part of the project.

## Reporting a vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Report security concerns privately using either of these channels:

1. Email:

```txt
security@tomorrowos.org
```

2. GitHub private vulnerability reporting for this repository (preferred when available): use **Security → Advisories → Report a vulnerability** on the TomorrowOS GitHub repository.

When reporting a vulnerability, please include as much detail as possible:

- Affected API, package or connector
- Affected operating system
- Device model, if known
- Firmware version, if known
- Steps to reproduce
- Potential impact
- Any suggested fix or mitigation

## Security areas we care about

TomorrowOS contributors should take extra care with:

- Local device APIs
- Remote commands
- Device credentials
- Access tokens
- Authentication and authorisation
- ZIP and widget package handling
- Package extraction
- Asset downloads
- Proof-of-play and proof-of-display data
- Screenshots
- Logs
- Telemetry
- Customer environments
- Network behaviour
- Fallback and recovery logic

## Responsible device control

TomorrowOS should never expose unsafe or unauthenticated device control.

Device-control features should be designed with clear boundaries, including:

- Authentication where required
- Permission checks where possible
- Safe defaults
- Clear unsupported states
- No hidden destructive actions
- No unnecessary access to customer data
- No logging of secrets or credentials

## Package and content safety

ZIP packages, widgets and external content should be treated as untrusted until validated.

TomorrowOS should aim to support:

- Manifest validation
- Checksum validation
- Safe extraction
- Protection against path traversal
- File type validation
- Package size limits
- Fallback content
- Rollback on failure
- Atomic activation where possible

## Capability honesty

Security also includes being honest about what a device, OS or connector can safely support.

If a feature is only partially supported, model-dependent, firmware-dependent, unsafe or requires a native bridge, it should be documented clearly.

Do not mark a capability as fully supported unless it has been tested or evidenced.

## Supported versions

TomorrowOS is currently in early development.

Until a stable release is published, security fixes will focus on the latest version of the project.

## Disclosure process

After a vulnerability is reported, maintainers will aim to:

1. Confirm receipt of the report
2. Review the issue
3. Assess severity and impact
4. Prepare a fix or mitigation
5. Release the fix where appropriate
6. Credit the reporter if they would like to be credited

## Public issues

Please use public GitHub issues for normal bugs, feature requests and capability gaps.

Do not use public issues for vulnerabilities, leaked credentials, customer data exposure or anything that could compromise devices or environments.
