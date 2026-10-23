# Security

Use the latest 2.x release and a patched Node.js version from the
[requirements](README.md#requirements). Updating this package does not update
Node.js on your machine or server.

## Reporting a vulnerability

**Do not post exploit details, credentials, or sensitive responses in a public issue.**

GitHub private vulnerability reporting is not currently enabled for this repository.
To request a private contact channel, open a minimal
[issue](https://github.com/SoftLari/banguat-exchange-rate/issues/new) titled
**“Private security contact requested”**, without technical or sensitive details.
Wait for a maintainer to provide a private channel before sharing the report.

Once a private channel is available, include the affected package and Node.js
versions, impact, and a minimal reproduction with synthetic data. Never include
production credentials or customer information. No response-time guarantee is made.

## Security boundaries

- Only configure trusted WSDL endpoints. SOAP operations involve network requests
  and parsing responses from the selected service.
- The `timeout` constructor option is not currently enforced. Applications must
  account for stalled requests; see the [API and limitations](README.md#configuration).
- Validate dates and verify rate semantics before using results in financial
  calculations. The library does not provide application-level financial controls.

## Dependency checks

CI audits production and development dependencies before testing and publishing.
Dependabot checks npm dependencies and GitHub Actions weekly. Run the same audit
locally with `mise exec -- npm audit` after following [local setup](CONTRIBUTING.md#local-setup).
A passing audit means no vulnerabilities were reported for that dependency tree
at that time, not that the application is guaranteed secure.
