# Support Policy

TomorrowOS is an open source unified API layer for digital signage operating systems.

This support policy explains what kind of help is available, what is not guaranteed, and how users should approach production deployments.

## Community support

TomorrowOS is currently supported through the open source community and project maintainers.

Community support may include:

- GitHub issues
- GitHub discussions
- Documentation updates
- Pull request reviews
- Bug reports
- Capability mapping feedback
- Example improvements
- General implementation guidance

Support is provided on a best-effort basis.

There are no guaranteed response times.

## No guaranteed support

TomorrowOS does not include guaranteed support unless a separate written commercial support agreement is in place.

The open source project does not provide:

- Guaranteed response times
- Emergency support
- Production incident support
- Uptime support
- On-call support
- Deployment support
- Customer support on behalf of third parties
- Support for modified forks
- Support for untested production environments
- Support for every OS, model or firmware version

## Production use

TomorrowOS may be used as a reference layer, SDK, API structure, connector framework or starting point for production systems.

However, using TomorrowOS in production is your responsibility.

Before using TomorrowOS in a live signage network, you should complete your own:

- Testing
- Security review
- Capability validation
- Device certification
- Firmware validation
- Rollback planning
- Monitoring setup
- Customer acceptance testing
- Operational support planning

TomorrowOS does not guarantee that a feature will work in every production environment.

## Small and large networks

This support policy applies to all environments, including:

- Single-screen tests
- Small signage networks
- Large signage networks
- Enterprise deployments
- Retail deployments
- QSR deployments
- Government deployments
- Healthcare deployments
- Transport deployments
- Mission-critical deployments
- Commercial products built on top of TomorrowOS

The project maintainers are not responsible for downtime, failed playback, failed updates, failed proof-of-play, failed device control or other operational issues in any network.

## Forks and modified versions

TomorrowOS may be forked and modified under the project license.

If you fork, modify or build on top of TomorrowOS, you are responsible for supporting your own version.

The project maintainers are not responsible for:

- Forked versions
- Modified versions
- Third-party connectors
- Third-party SDKs
- Third-party dashboards
- Third-party commercial products
- Third-party deployments
- Third-party support promises
- Third-party customer environments

If you change the code, APIs, connectors, security model or deployment flow, you are responsible for testing and supporting those changes.

## What to use GitHub issues for

Use GitHub issues for:

- Bug reports
- Feature requests
- Documentation gaps
- API design feedback
- Capability mapping gaps
- OS-specific behaviour
- Device-specific behaviour
- Firmware-specific behaviour
- Playback issues
- Package handling issues
- Sync issues
- Testing and certification gaps

## What not to use GitHub issues for

Do not use public GitHub issues for:

- Security vulnerabilities
- Leaked credentials
- Access tokens
- Customer data
- Private deployment details
- Emergency production incidents
- Commercial support requests
- Confidential customer environments

Security issues should be reported privately using the process in `SECURITY.md`.

## Reporting a bug

When reporting a bug, please include as much detail as possible.

Helpful details include:

- TomorrowOS package or area affected
- Operating system
- Device model
- Firmware version
- Browser engine or runtime, if known
- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Logs or screenshots, if safe to share
- Whether the issue happens consistently or intermittently
- Any fallback behaviour observed

## Reporting a capability gap

When reporting a capability gap, please include:

- Feature name, if known
- OS
- Device model
- Firmware version
- Runtime or browser engine
- What you expected to work
- What actually happened
- Whether a bridge, agent or native API was used
- Any known workaround
- Whether the feature should be marked as `unsupported`, `partial`, `model-dependent`, `firmware-dependent`, `requires-bridge`, `unsafe` or `unknown`

## Commercial support

Commercial support may be offered separately in the future.

Commercial support may include:

- Production deployment guidance
- Private integration support
- Device certification
- Custom connector development
- Enterprise support agreements
- SLA-backed support
- Priority issue handling
- Training and onboarding
- Architecture review

Commercial support is not included by default in the open source project.

## Documentation-first approach

Before opening an issue, please check:

- `README.md`
- `docs/README.md`
- `docs/api/overview.md`
- `docs/capabilities/capability-matrix.md`
- Relevant guides in `docs/guides/`
- Existing GitHub issues and discussions

If the documentation is unclear, please open an issue or pull request to help improve it.

## Summary

TomorrowOS is open source infrastructure.

Community support is best-effort.

Production use is your responsibility.

For security issues, follow `SECURITY.md`.

For legal and liability limitations, see `DISCLAIMER.md`.
