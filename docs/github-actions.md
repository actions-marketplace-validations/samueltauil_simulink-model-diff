# GitHub Actions integration

[Documentation index](README.md) | [Project README](../README.md)

The published release is the supported integration point. Consumers reference
the repository at a release tag; they do not copy this repository into their
own project and they do not use a local path.

There are two hosted surfaces:

- the published Action at `samueltauil/simulink-model-diff@v0.4.1`;
- an optional reusable workflow at
  `samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.4.1`.

The Action is the primary integration. GitHub downloads it from the tagged
release when it appears in a job's `steps`. The reusable workflow is a wrapper
that also owns checkout, artifact upload, and optional SARIF upload.

These forms are not interchangeable:

```yaml
# Published Action: use inside steps.
- uses: samueltauil/simulink-model-diff@v0.4.1

# Reusable workflow: use at the job level.
uses: samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.4.1
```

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

jobs:
  model-drift:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Check out pull request history
        uses: actions/checkout@v7
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Analyze model drift
        id: drift
        uses: samueltauil/simulink-model-diff@v0.4.1
        with:
          include: |
            models/**/*.slx
            canonical/**/*.model.json
          fail-on: error

      - name: Upload model drift reports
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: simulink-model-drift-${{ github.run_id }}
          path: build/model-drift
          if-no-files-found: warn
          retention-days: 14
```

This checks out the consumer repository, then GitHub downloads the Action from
the `v0.4.1` tag. Consumers do not clone or vendor this project.

## Action inputs and outputs

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

The Action outputs `output`, `index-json`, `summary-markdown`, `sarif`,
`review-status`, and `exit-code`. `review-status` is `blocked`,
`review-required`, or `clear`. A custom `rules` path must exist in the consumer
repository. Artifact retention and SARIF upload are workflow responsibilities,
not Action inputs.

## Optional reusable workflow

Use the wrapper when you want this project to own checkout, artifact retention,
and fork-safe SARIF upload:

```yaml
permissions:
  contents: read
  security-events: write

jobs:
  model-drift:
    uses: samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.4.1
    with:
      include: |
        models/**/*.slx
        canonical/**/*.model.json
      fail-on: error
      upload-sarif: true
```

`upload-sarif` and `artifact-retention-days` are inputs of this reusable
workflow only. They are not inputs of the root Action. GitHub does not let a
called workflow elevate permissions beyond the caller, so SARIF requires
`security-events: write`. The SARIF job skips fork pull requests.

### Outputs

The published Action's deterministic outputs are:

| Output | Value |
| --- | --- |
| `output` | Configured report directory |
| `index-json` | `<output>/model-drift-index.json` |
| `summary-markdown` | `<output>/model-drift-summary.md` |
| `sarif` | `<output>/model-drift.sarif` |
| `review-status` | `blocked`, `review-required`, or `clear` |
| `exit-code` | Stable analyzer exit code |

The Action writes the aggregate Markdown to `GITHUB_STEP_SUMMARY`. The summary
and aggregate JSON use the same reviewer priority order as the Copilot canvas.
The Action does not upload artifacts, upload SARIF, comment on the pull request,
or request permissions.

## Hand the artifact to the review canvas

The recommended workflow uploads an artifact named
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

## Checkout requirements

PR analysis reads repository state at both commits. Callers using the published
composite action directly must check out their own repository with:

```yaml
- uses: actions/checkout@v7
  with:
    fetch-depth: 0
    persist-credentials: false
```

A shallow checkout is unsupported because the base commit or changed model
blobs may be missing. If repository policy prevents a full fetch, fetch the
exact base and head objects before invoking the Action.

## Fork and permission model

- Trigger automatic analysis with `pull_request`.
- Never use `pull_request_target` to check out and execute pull-request content.
- Do not pass secrets to analysis.
- Keep the analysis job at `contents: read`.
- Put `security-events: write` only on the SARIF upload job.
- Skip SARIF for fork PRs; retain the summary and artifact as the portable result.
- Keep `persist-credentials: false`.

The direct Action sample implements read-only analysis and safe checkout. The
optional reusable workflow also implements the separate fork-safe SARIF job. A
repository may add another trusted workflow for comments or checks, but it must
not execute untrusted pull-request content with elevated credentials.

## Licensed extraction

The public pull-request samples run on `ubuntu-latest` and are not a licensed
MATLAB execution boundary. Do not change them to a privileged self-hosted
runner for automatic pull-request events.

Use [`licensed-slx.yml`](../samples/github-actions/licensed-slx.yml) as the
starting point for a manually dispatched, environment-approved analysis of
trusted refs. See [Runner setup](runner-setup.md).

## Release pinning

Pin `v0.4.1` for the supported Action contract, or pin the full release commit
SHA for an immutable supply-chain reference. The optional reusable workflow
self-references the Action from the same release; do not mix a newer workflow
contract with an older Action.

The `v0.4.1` tag is also the release boundary for the Python package,
report schemas, action metadata, and workflow contract. Upgrade those surfaces
together.
