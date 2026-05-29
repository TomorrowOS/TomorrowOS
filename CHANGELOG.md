# Changelog

All notable changes to TomorrowOS will be documented in this file.

TomorrowOS is an open source project for digital signage.

This changelog is intended to track project releases, API changes, documentation updates, capability model changes, SDK updates, connector updates and certification changes.

## Versioning

TomorrowOS intends to follow semantic versioning once the project reaches a stable release.

Semantic versioning generally follows this structure:

```txt
MAJOR.MINOR.PATCH
```

Example:

```txt
1.2.3
```

Where:

| Version part | Meaning |
| --- | --- |
| Major | Breaking changes |
| Minor | New backwards-compatible features |
| Patch | Bug fixes or small improvements |

Before version `1.0.0`, APIs may change more frequently.

## Release format

Each release should include:

- Version number
- Release date
- Summary
- Added features
- Changed features
- Fixed issues
- Removed features
- Breaking changes
- Security updates
- Known issues
- Migration notes, if needed

## Categories

Use the following categories where relevant.

### Added

New features, docs, APIs, examples, tests or capability records.

### Changed

Changes to existing functionality, documentation, API behaviour or project structure.

### Fixed

Bug fixes, corrections, documentation fixes or test fixes.

### Removed

Features, APIs, docs or behaviours that have been removed.

### Deprecated

Features or APIs that still exist but should no longer be used.

### Security

Security-related fixes, improvements or disclosures.

### Known issues

Known bugs, limitations or platform-specific issues that still exist.

## Unreleased

### Added

- Initial public project structure
- Core project documentation
- API overview
- Capability matrix documentation
- Black-gap playback guide
- Widget and ZIP package handling guide
- Asset download and atomic activation guide
- Beginners guide
- Developer guide
- Project roadmap
- Governance policy
- Support policy
- Security policy
- Disclaimer
- Trademark and brand usage policy

### Changed

- Nothing yet.

### Fixed

- Nothing yet.

### Removed

- Nothing yet.

### Deprecated

- Nothing yet.

### Security

- Initial security policy added.

### Known issues

- TomorrowOS is in early development.
- APIs are not yet stable.
- SDK package structure is not yet implemented.
- CLI package structure is not yet implemented.
- OS connectors are not yet implemented.
- Certification test suite is not yet implemented.
- Capability records are examples only until tested against real devices.

## 0.1.0 - Initial Foundation

Planned first foundation release.

### Added

- Initial repository setup
- Project README
- MIT license
- Code of conduct
- Contributing guide
- Security policy
- Disclaimer
- Support policy
- Roadmap
- Governance policy
- Trademark and brand usage policy
- Documentation overview
- API overview
- Capability matrix
- Beginner documentation
- Developer documentation
- Playback failure documentation
- Package handling documentation
- Asset handling documentation

### Notes

This release is intended to establish the direction of TomorrowOS.

It does not represent a production-ready SDK, connector, runtime or certification suite.

## Future release areas

Future releases may include:

- `@tomorrowos/sdk`
- `@tomorrowos/cli`
- Capability schema
- Package manifest schema
- Proof event schema
- Example signage app
- Example CMS player
- Example widget package
- Certification test runner
- Tizen connector documentation
- webOS connector documentation
- BrightSign connector documentation
- Android connector documentation
- Browser runtime documentation
- Mock runtime for local development

## Changelog rules

When updating this file:

- Keep entries clear and concise
- Group changes by version
- Put newest releases at the top
- Call out breaking changes clearly
- Call out security changes clearly
- Mention migration notes where needed
- Do not overstate production readiness
- Be honest about known limitations

## Production readiness note

A changelog entry does not mean a feature is production-ready.

Production use should always depend on:

- Tested device model
- Tested firmware version
- Tested operating system
- Capability evidence
- Security review
- Certification testing
- Deployment validation
- Fallback and rollback planning

See:

```txt
DISCLAIMER.md
SUPPORT.md
docs/capabilities/capability-matrix.md
```
