# GitHub Actions integration

The primary product surface is the reusable PR workflow at `.github/workflows/pr-analysis.yml`. It combines the permission-free composite action with full-history checkout, artifact retention, and an optional separately permissioned SARIF upload.

## Recommended consumer workflow

```yaml
name: Simulink model drift

on:
  pull_request:
    paths:
      - "**/*.slx"
      - "**/*.mdl"
      - "**/*.model.json"
      - "model-drift/rules/**"

permissions:
  contents: read
  security-events: write

jobs:
  model-drift:
    uses: samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.3.0
    with:
      include: |
        models/**/*.slx
        canonical/**/*.model.json
      rules: model-drift/rules/default-rules.yml
      fail-on: error
      upload-sarif: true
```

Use `contents: read` only when `upload-sarif` is false. GitHub does not let a called workflow elevate permissions beyond the caller, so consumers enabling SARIF must grant `security-events: write`. The SARIF job still skips fork pull requests.

## Reusable workflow inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `base-ref` | PR base SHA | Explicit base commit SHA or ref |
| `head-ref` | PR head SHA | Explicit head commit SHA or ref |
| `include` | `.slx`, `.mdl`, `.model.json` globs | Comma- or newline-separated model globs |
| `rules` | `model-drift/rules/default-rules.yml` | Rules YAML path |
| `output` | `build/model-drift` | Aggregate and per-model report directory |
| `fail-on` | `error` | `none`, `warning`, or `error` |
| `extractor-command` | empty | Optional non-privileged canonical extractor command |
| `python-version` | `3.12` | Python runtime |
| `artifact-retention-days` | `14` | Report artifact retention |
| `upload-sarif` | `false` | Upload SARIF for trusted events |

The workflow outputs `output`, `index-json`, `summary-markdown`, `sarif`, and `exit-code`.

## Composite action inputs and outputs

The root action accepts the same analysis inputs except artifact retention and SARIF upload. Its deterministic outputs are:

| Output | Value |
| --- | --- |
| `output` | Configured report directory |
| `index-json` | `<output>/model-drift-index.json` |
| `summary-markdown` | `<output>/model-drift-summary.md` |
| `sarif` | `<output>/model-drift.sarif` |
| `exit-code` | Stable analyzer exit code |

The action always attempts to write the aggregate Markdown to `GITHUB_STEP_SUMMARY`. It deliberately does not upload artifacts, upload SARIF, comment on the PR, or request permissions.

## Checkout requirements

PR analysis reads repository state at both commits. Callers using the composite action directly must use:

```yaml
- uses: actions/checkout@v7
  with:
    fetch-depth: 0
    persist-credentials: false
```

A shallow checkout is unsupported because the base commit or changed model blobs may be missing. If repository policy prevents a full fetch, fetch the exact base and head objects before invoking the action.

## Fork and permission model

- Trigger automatic analysis with `pull_request`.
- Never use `pull_request_target` to check out and execute pull-request content.
- Do not pass secrets to analysis.
- Keep the analysis job at `contents: read`.
- Put `security-events: write` only on the SARIF upload job.
- Skip SARIF for fork PRs; retain the summary and artifact as the portable result.
- Keep `persist-credentials: false`.

The reusable workflow implements these defaults. A repository may add a separate trusted workflow for comments or checks, but it must not execute untrusted PR content with elevated credentials.

## Licensed extraction

The reusable PR workflow runs on `ubuntu-latest` and is not a licensed MATLAB execution boundary. Do not change it to a privileged self-hosted runner for automatic PR events.

Use [`licensed-slx.yml`](../examples/github-actions/licensed-slx.yml) as the starting point for a manually dispatched, environment-approved analysis of trusted refs. See [Runner setup](runner-setup.md).

## Release pinning

The reusable workflow self-references the action from the same release line. Publish the action and reusable workflow together. Pin `v0.3.0` or a reviewed full commit SHA; do not mix a newer workflow contract with an older composite action.
