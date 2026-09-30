# GitHub Actions integration

The published release is the supported integration point. Consumers reference
the repository at a release tag; they do not copy this repository into their
own project and they do not use a local path.

There are two hosted surfaces:

- the reusable workflow at
  `samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.3.1`;
- the composite action at `samueltauil/simulink-model-diff@v0.3.1`.

Use the reusable workflow unless you need to own checkout, artifact retention,
or surrounding workflow steps. Both references resolve to the same published
release contract.

## Recommended consumer workflow

```yaml
name: Simulink model drift

on:
  pull_request:
    paths:
      - "**/*.slx"
      - "**/*.mdl"
      - "**/*.model.json"

permissions:
  contents: read
  security-events: write

jobs:
  model-drift:
    uses: samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.3.1
    with:
      include: |
        models/**/*.slx
        canonical/**/*.model.json
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
| `rules` | empty | Optional repository-relative rules YAML path; empty uses built-in rules |
| `output` | `build/model-drift` | Aggregate and per-model report directory |
| `fail-on` | `error` | `none`, `warning`, or `error` |
| `extractor-command` | empty | Optional non-privileged canonical extractor command |
| `python-version` | `3.12` | Python runtime |
| `artifact-retention-days` | `14` | Report artifact retention |
| `upload-sarif` | `false` | Upload SARIF for trusted events |

The workflow outputs `output`, `index-json`, `summary-markdown`, `sarif`, and `exit-code`.
The called workflow checks out the consumer repository, so a custom `rules`
path must exist in that repository.

## Hand the artifact to the review canvas

The reusable workflow uploads an artifact named
`simulink-model-drift-<run-id>`. Download it into a checkout of the pull
request:

```bash
gh run download <run-id> \
  --name simulink-model-drift-<run-id> \
  --dir build/model-drift
```

Then open the aggregate index from a GitHub Copilot app session in that
checkout:

```text
Open the Simulink Model Diff canvas for build/model-drift/model-drift-index.json
```

The canvas reads the downloaded JSON and nothing else. It does not call the
Actions API, write a pull-request review, change a check result, or elevate
permissions. GitHub branch protection and the configured policy threshold
remain authoritative.

See [the canvas guide](copilot-canvas.md) for the full review sequence.

## Direct composite action use

Use the hosted composite action when the caller needs custom workflow steps:

```yaml
- uses: actions/checkout@v7
  with:
    fetch-depth: 0
    persist-credentials: false

- id: drift
  uses: samueltauil/simulink-model-diff@v0.3.1
  with:
    include: |
      models/**/*.slx
      canonical/**/*.model.json
    output: build/model-drift
    fail-on: error
```

The action is downloaded by GitHub from the tagged release. The caller does
not need to install the Python package or check out this repository. The
checkout step above is for the consumer repository whose model history is being
analyzed.

## Composite action inputs and outputs

The published root action accepts the same analysis inputs except artifact
retention and SARIF upload. Its deterministic outputs are:

| Output | Value |
| --- | --- |
| `output` | Configured report directory |
| `index-json` | `<output>/model-drift-index.json` |
| `summary-markdown` | `<output>/model-drift-summary.md` |
| `sarif` | `<output>/model-drift.sarif` |
| `exit-code` | Stable analyzer exit code |

The action always attempts to write the aggregate Markdown to `GITHUB_STEP_SUMMARY`. It deliberately does not upload artifacts, upload SARIF, comment on the PR, or request permissions.

## Checkout requirements

PR analysis reads repository state at both commits. Callers using the published composite action directly must check out their own
repository with:

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

Use [`licensed-slx.yml`](../samples/github-actions/licensed-slx.yml) as the starting point for a manually dispatched, environment-approved analysis of trusted refs. See [Runner setup](runner-setup.md).

## Release pinning

The reusable workflow self-references the composite action from the same
release. The project publishes the workflow and action together. Pin
`v0.3.1` for the supported release contract, or pin the full commit SHA for an
immutable supply-chain reference. Do not mix a newer workflow contract with an
older composite action.

The `v0.3.1` tag is also the release boundary for the Python package,
report schemas, action metadata, and workflow contract. Upgrade those surfaces
together.
