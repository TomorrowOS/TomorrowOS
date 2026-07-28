---
title: "Governance"
sidebarTitle: "Governance"
---

# Governance

TomorrowOS is an open source unified API layer for digital signage operating systems.

This governance document explains how the project is managed, how decisions are made, how contributors can participate, and how the project should evolve over time.

## Project purpose

TomorrowOS exists to help developers, integrators, CMS vendors, hardware partners and signage teams build more reliable cross-platform signage software.

The project is focused on:

- Unified signage APIs
- Capability mapping
- Playback reliability
- Black-gap prevention
- ZIP and widget package handling
- Asset validation and atomic activation
- Device control boundaries
- Telemetry
- Proof-of-play
- Proof-of-display
- Synchronisation
- Testing and certification
- OS-specific documentation

TomorrowOS should remain focused on being an open source operating layer for signage functionality.

## Governance principles

TomorrowOS should be governed with the following principles:

- Keep the project useful for real signage deployments
- Be honest about OS, firmware and device limitations
- Do not overstate support
- Favour safe defaults
- Protect users from unsafe device-control patterns
- Require evidence for capability claims
- Keep the API simple for developers
- Make documentation clear for technical and non-technical users
- Encourage useful contributions from the signage industry
- Avoid adding features that turn TomorrowOS into a full CMS by default

## Maintainers

Maintainers are responsible for the overall direction, safety and quality of the project.

Maintainers may:

- Review issues
- Review pull requests
- Approve or reject contributions
- Update documentation
- Manage releases
- Manage project structure
- Moderate discussions
- Enforce the Code of Conduct
- Handle security reports
- Decide whether features belong in the project
- Decide when a capability is ready to be marked as supported

Maintainers should act in the best interest of the project and the wider signage community.

## Contributors

Contributors may help by:

- Reporting bugs
- Suggesting features
- Improving documentation
- Adding examples
- Adding capability evidence
- Reporting OS-specific behaviour
- Reporting model-specific behaviour
- Reporting firmware-specific behaviour
- Proposing API changes
- Adding tests
- Building connectors
- Reviewing pull requests

Contributors should follow:

- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `DISCLAIMER.md`
- `SUPPORT.md`

## Decision making

Project decisions should be based on:

- Real-world signage usefulness
- Technical quality
- Safety
- Security
- Simplicity
- Backwards compatibility
- Evidence from tested devices
- Long-term maintainability
- Whether the change supports the purpose of TomorrowOS

Maintainers may make final decisions where consensus is not reached.

## API changes

TomorrowOS APIs should be changed carefully.

API changes should consider:

- Developer experience
- Existing examples
- Documentation impact
- Capability matrix impact
- Certification test impact
- OS connector impact
- Backwards compatibility
- Security impact
- Whether the API is too specific to one platform

Breaking changes should be clearly documented.

Major API changes should ideally go through an RFC process.

## RFC process

An RFC is a Request for Comments.

RFCs should be used for significant changes, such as:

- New API domains
- Major method changes
- Capability status changes
- New connector models
- Certification model changes
- Security model changes
- Package handling changes
- Governance changes
- Release process changes

RFCs should live in:

```txt
rfcs/
```

Example:

```txt
rfcs/0001-api-principles.md
```

An RFC should include:

- Summary
- Problem
- Proposed solution
- Alternatives considered
- Security impact
- Compatibility impact
- Documentation impact
- Certification impact
- Open questions

## Capability governance

Capability mapping is one of the most important parts of TomorrowOS.

A feature should not be marked as `supported` unless there is evidence.

Evidence may include:

- Tested OS
- Tested device model
- Tested firmware version
- Runtime or browser engine
- Test method
- Known limitations
- Required bridge or agent
- Fallback behaviour
- Date tested

Capability support should use one of these statuses:

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

If support is uncertain, it should not be marked as supported.

## Security governance

Security issues must be handled carefully.

Security vulnerabilities should not be reported in public GitHub issues.

Security reports should follow the process in:

```txt
SECURITY.md
```

Maintainers may privately review, fix and release security updates before public disclosure.

Security-sensitive areas include:

- Local device APIs
- Remote commands
- Device credentials
- Access tokens
- Authentication
- Authorisation
- Package extraction
- ZIP and widget handling
- Screenshots
- Logs
- Telemetry
- Proof-of-play data
- Customer environments

## Release governance

Releases should be versioned and documented.

TomorrowOS should aim to follow semantic versioning once the project is stable.

Before v1.0, APIs may change more frequently.

A release should ideally include:

- Version number
- Summary of changes
- Breaking changes
- New features
- Fixed bugs
- Documentation updates
- Known issues
- Migration notes where needed

Release notes should be reflected in:

```txt
CHANGELOG.md
```

## Maintainer changes

New maintainers may be added when they have shown:

- Consistent useful contributions
- Good judgement
- Respect for the project direction
- Care with security
- Care with capability evidence
- Constructive communication
- Understanding of the signage industry or relevant technical areas

Maintainer removal may occur if a maintainer:

- Violates the Code of Conduct
- Acts against the project’s interests
- Mishandles security reports
- Misuses project access
- Becomes inactive for a long period
- Creates legal, security or reputational risk for the project

## Community discussions

Community discussions should stay focused on improving TomorrowOS.

Good discussion topics include:

- API design
- OS support
- Device capability gaps
- Playback behaviour
- Package handling
- Sync behaviour
- Proof-of-play
- Certification tests
- Documentation
- Security patterns
- Real-world deployment lessons

Discussions should avoid:

- Personal attacks
- Vendor bashing
- Unsupported claims
- Sharing confidential customer data
- Sharing credentials or private keys
- Public security disclosures

## Scope control

TomorrowOS should avoid becoming too broad.

The project should not become a full CMS by default.

Features should be considered carefully if they move TomorrowOS into:

- Content scheduling as a full CMS
- User management as a hosted platform
- Billing
- Ad network operations
- Creative design tools
- Customer dashboards
- Managed service workflows

Those may be built on top of TomorrowOS, but they are not the core open source purpose.

## Commercial use

TomorrowOS may be used commercially, subject to the project license and disclaimer.

Commercial users are responsible for:

- Their own testing
- Their own customer support
- Their own production deployment
- Their own security
- Their own compliance
- Their own forks or modifications
- Their own service level agreements
- Their own customer obligations

The open source project does not provide commercial support by default.

See:

```txt
SUPPORT.md
DISCLAIMER.md
LICENSE.md
```

## Project direction

The long-term goal is for TomorrowOS to become a trusted open source operating layer for digital signage.

The project should help the industry build better signage software while staying honest about what each platform, OS, model and firmware version can actually support.

The goal is not to hide complexity.

The goal is to make complexity easier to manage.
