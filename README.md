# Simulink Model Drift

Simulink Model Drift is a PR-native GitHub Action for reviewing model changes before merge. It discovers changed models between the pull request base and head commits, evaluates configured rules, and publishes one aggregate review summary plus downloadable evidence for every analyzed model.

The default product experience is automatic pull-request analysis. Canonical manifests and the Python CLI remain supported lower-level interfaces for teams that need custom pipelines or non-GitHub execution.

## What reviewers get

Every run writes:

- `model-drift-index.json`: machine-readable aggregate status and per-model report index;
- `model-drift-summary.md`: aggregate Markdown written to the GitHub job summary;
- `model-drift.sarif`: aggregate policy findings for optional code-scanning upload;
- per-model reports beneath the configured output directory.

The analyzer reports added, removed, modified, moved, and unresolved model elements. Policy findings can fail the PR at `warning` or `error` severity while reports remain available as workflow artifacts.

## Copilot visual diff canvas

This repository includes a project-scoped GitHub Copilot CLI canvas extension in
`.github/extensions/simulink-model-diff-canvas`. When the repository is open in
Copilot CLI, ask Copilot to open the **Simulink Model Diff** canvas with either
an aggregate PR index or an individual drift report:

```text
Open the Simulink Model Diff canvas for build/model-drift/model-drift-index.json
```

The canvas renders changed models, aggregate counters, analysis and policy
status, and color-coded element-level before/after values. It consumes the
deterministic JSON artifacts produced by this tool; it does not load or execute
the `.slx` file and does not claim to reproduce the native Simulink editor.

The default report path is `build/model-drift/model-drift-index.json`. The
canvas also accepts a lower-level report such as
`examples/output/controller.drift.json`. Report paths are restricted to the
active workspace, and the local renderer binds only to loopback.

## Adopt in one workflow

Copy [the minimal consumer workflow](examples/github-actions/canonical-pr.yml) into `.github/workflows/simulink-model-drift.yml`:

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
      rules: model-drift/rules/default-rules.yml
      fail-on: error
      upload-sarif: true
```

The reusable workflow:

1. checks out complete history with `fetch-depth: 0`;
2. derives the base and head SHAs from the pull request event;
3. runs the composite action on a GitHub-hosted runner;
4. writes the aggregate Markdown to `GITHUB_STEP_SUMMARY`;
5. uploads the complete report directory even when policy fails;
6. uploads SARIF in a separate least-privilege job only for trusted events.

Pin a reviewed release commit SHA when your supply-chain policy requires an immutable reference. The reusable workflow and composite action must come from the same release.

## Fork pull-request safety

The supported automatic trigger is `pull_request`, never `pull_request_target`.

- The analysis job has only `contents: read`.
- Checkout disables persisted credentials and fetches full history so both PR commits are available.
- Fork PRs receive no repository secrets.
- SARIF upload is skipped for fork PRs because their token cannot safely receive `security-events: write`.
- Reports still appear in the job summary and artifact for fork PRs.
- Automatic PR analysis runs only on a GitHub-hosted runner.

Do not route untrusted fork models to a self-hosted MATLAB runner. See [Security](docs/security.md) and [Runner setup](docs/runner-setup.md).

## Composite action

Use the composite action directly when the caller needs to own checkout, artifact retention, or other workflow behavior:

```yaml
- uses: actions/checkout@v7
  with:
    fetch-depth: 0
    persist-credentials: false

- id: drift
  uses: samueltauil/simulink-model-diff@v0.3.0
  with:
    include: |
      models/**/*.slx
      canonical/**/*.model.json
    rules: model-drift/rules/default-rules.yml
    output: build/model-drift
    fail-on: error
```

`base-ref` and `head-ref` default to `github.event.pull_request.base.sha` and `github.event.pull_request.head.sha`. Outside a PR event, pass both explicitly. The action requests no permissions, uploads nothing, and exposes deterministic report paths for caller-owned artifact or SARIF steps.

See [GitHub Actions integration](docs/github-actions.md) for every input, output, permission, and event boundary.

## Licensed `.slx` extraction boundary

The public PR workflow does not include MATLAB or Simulink. A semantic extractor may require licensed MathWorks products, proprietary dependencies, and model-controlled execution such as callbacks or custom code.

Use [the licensed runner example](examples/github-actions/licensed-slx.yml) only as a manually dispatched, environment-approved workflow on an ephemeral, dedicated runner. It must not run automatically for fork PRs and must not hold deployment credentials. The checked-in extractor is a best-effort adapter and has not been qualified across MATLAB/Simulink releases in this repository.

## PR command contract

The action is a distribution wrapper around:

```bash
simulink-model-drift pr \
  --base-ref <sha> \
  --head-ref <sha> \
  --rules model-drift/rules/default-rules.yml \
  --output build/model-drift \
  --include "models/**/*.slx" \
  --fail-on error
```

Add `--include` for each model glob and `--extractor-command "..."` when a reviewed extractor is available. The command compares repository state at the two refs; it does not require callers to prepare explicit file pairs.

## Lower-level canonical and CLI interfaces

Canonical JSON is the portable semantic contract beneath PR analysis. It is useful for license-free CI, deterministic fixtures, and integrations that produce manifests outside GitHub.

```bash
simulink-model-drift analyze \
  --base examples/canonical/controller-base.model.json \
  --target examples/canonical/controller-target.model.json \
  --rules examples/rules/default-rules.yml \
  --output build/model-drift \
  --fail-on none
```

The lower-level `analyze`, `compare`, `validate`, `doctor`, `schema`, and `fingerprint` commands are documented in [the CLI guide](docs/cli.md). Pair-oriented output names and contracts belong to those interfaces; PR analysis uses the aggregate files listed above.

## Simulink `.slx` format basics

Official MathWorks guidance describes the `.slx` file as a ZIP-based Open Packaging Convention (OPC) package, not as a single XML document. The package typically contains a root `[Content_Types].xml` manifest plus model and metadata members such as `simulink/blockdiagram.xml`, `simulink/configSetInfo.xml`, `simulink/stateflow.xml`, and `metadata/mwcoreProperties.xml`.

`simulink-model-drift inspect-slx <artifact>` validates that this package structure is present and emits an inventory without claiming semantic extraction. This is intentionally a bounded safety check: the file may be a valid Simulink package while still needing an approved MATLAB/Simulink extractor to produce a trustworthy canonical manifest.

## Capability boundaries

- Structural drift is not proof of behavioral equivalence.
- Raw SLX package inspection is bounded diagnostics, not semantic extraction.
- Complete semantic analysis requires a supported extractor and an explicit `analysis.status`.
- Partial, unsupported, or failed extraction remains visible and cannot become a clean “no drift” result.
- Rename and move detection may conservatively appear as removal plus addition.
- SARIF locations for model elements are less precise than source-code line annotations.

## Project status and release policy

The canonical comparison engine and deterministic reporters are implemented. The PR-native action and reusable workflow are the next public action contract and are documented under `Unreleased`; release them together as `v0.3.0` before external adoption. Consumers should pin an exact release or reviewed commit SHA.

See [Getting started](docs/getting-started.md), [Architecture](docs/architecture.md), [Security](docs/security.md), [CHANGELOG.md](CHANGELOG.md), and [ROADMAP.md](ROADMAP.md).

## License

Released under the [MIT License](LICENSE). MATLAB and Simulink are separate MathWorks products and are not included.
