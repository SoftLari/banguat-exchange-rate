# Contributing

Bug reports, focused pull requests, and documentation improvements are welcome.
Check [existing issues](https://github.com/SoftLari/banguat-exchange-rate/issues)
before starting a larger change. For vulnerabilities, use [SECURITY.md](SECURITY.md).

## Local setup

Install [mise](https://mise.jdx.dev/getting-started.html), then:

```bash
git clone https://github.com/SoftLari/banguat-exchange-rate.git
cd banguat-exchange-rate
mise install
mise exec -- npm ci
```

`mise.toml` selects the project's Node.js version. `mise exec` works without shell
activation. Use npm and commit `package-lock.json` when changing dependencies;
do not introduce another lockfile or edit generated `dist/` files.

## Check your change

```bash
mise exec -- npm audit
mise exec -- npm run build
mise exec -- npm test -- --runInBand
```

For watch mode, run `mise exec -- npm run test:watch`. To check what consumers
receive, run `mise exec -- npm pack --dry-run`.

The unit suite mocks SOAP responses. The integration test uses the real SOAP
client and a loopback HTTP server on an ephemeral port. Neither suite contacts
Banguat; tests require permission to bind a local port, not upstream availability.
CI repeats installation, audit, build, and tests on Node.js 22 and 24.

## Find the right file

| Path | Responsibility |
| --- | --- |
| `src/banguat-service.ts` | SOAP calls, date conversion, response validation, and result mapping. |
| `src/types.ts` / `src/index.ts` | Public types and package exports. |
| `src/cli/banguat.ts` | CLI arguments, output, and exit codes. |
| `src/banguat-service*.test.ts` | Unit tests and local SOAP integration coverage. |
| `.github/workflows/` | Test matrix and release-triggered npm publishing. |

## Open a pull request

- Branch from `master` and keep the change focused on one outcome.
- Explain the problem, the intended behavior, and how you verified it.
- Add or update tests for behavior changes and docs for user-facing changes.
- Be explicit about changes to date handling, rate-field mapping, return types,
  supported Node versions, or CLI behavior. These can affect existing consumers.
- Keep real responses, credentials, and private infrastructure details out of
  fixtures and logs. Prefer minimal synthetic SOAP examples.

There is no separate lint script. Use the commands above rather than adding
unrelated tooling to a change.

## Releases

Releases are maintainer-managed. A newly created GitHub release triggers the npm
publishing workflow after audit, build, and tests. See [CHANGELOG.md](CHANGELOG.md)
for compatibility changes. Do not publish or bump versions as part of a normal PR:
the package's version hooks can push commits and tags.
