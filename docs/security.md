# Security

Simulink models and pull-request code are untrusted input. The safe default is a GitHub-hosted `pull_request` workflow with read-only contents access, no secrets, no persisted checkout credential, and no licensed or privileged services.

## Event model

- Use `pull_request` for automatic analysis.
- Never use `pull_request_target` to check out and execute PR content.
- Do not expose secrets to fork or same-repository PR analysis.
- Treat same-repository branches as untrusted unless repository policy prevents untrusted authors from modifying them.

## Workflow permissions

The reusable workflow separates capabilities:

1. `analyze` uses `contents: read`, executes the analyzer, writes the job summary, and uploads an artifact.
2. `upload-sarif` uses `security-events: write`, consumes the generated artifact, and skips fork PRs.

The composite action requests no permissions and performs no uploads. GitHub requires callers to grant any permission used by a called workflow; enabling SARIF therefore requires `security-events: write` in the caller.

## Checkout and ref integrity

PR analysis requires both commit objects, so checkout uses `fetch-depth: 0`. Base and head refs default from the event payload, not branch names controlled by shell interpolation. Inputs are passed as argument-array values rather than evaluated shell fragments.

`extractor-command` is still executable configuration. Keep it fixed in a reviewed workflow and do not derive it from PR-controlled data.

## Fork behavior

Fork PRs run analysis on a GitHub-hosted runner without secrets. SARIF upload is skipped. The aggregate Markdown and artifact remain available. Never attach a license-bearing or network-privileged self-hosted runner to that path.

## Model execution boundary

Loading `.slx` or `.mdl` can involve callbacks, scripts, custom code, references, libraries, dictionaries, and product-specific behavior. Canonical manifest comparison does not execute those features. A semantic extractor must run in a dedicated, disposable environment with explicit policy and bounded resources.

## Report safety

Model paths, names, parameters, and rule messages are untrusted. Reporters must escape content for Markdown and SARIF, normalize repository-relative paths, validate schemas, and avoid secrets or proprietary details in logs. Incomplete extraction must remain an explicit result.

## Review canvas boundary

The [Copilot app canvas](copilot-canvas.md) reads analyzer JSON that already
exists on disk. It does not open the `.slx` package, run an extractor, or call
the GitHub API, so it cannot approve a pull request or change a check result.

Report paths are resolved against the active workspace and rejected when they
escape it. Input must be a JSON file no larger than 64 MiB. The renderer binds
to an ephemeral loopback port, serves one instance per canvas session, and sets
a restrictive content security policy. Because report content is untrusted, the
renderer escapes model names, parameters, and rule messages before display.

See [Runner setup](runner-setup.md) for licensed environments and [SECURITY.md](../SECURITY.md) for vulnerability reporting.
