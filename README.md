# Simulink Model Drift

Detect Simulink model drift in pull requests and review it before merge.

[![CI](https://github.com/samueltauil/simulink-model-diff/actions/workflows/simulink-model-drift.yml/badge.svg)](https://github.com/samueltauil/simulink-model-diff/actions/workflows/simulink-model-drift.yml)
[![Release](https://img.shields.io/badge/release-v0.3.1-2ea44f)](https://github.com/samueltauil/simulink-model-diff/releases/tag/v0.3.1)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](pyproject.toml)

Binary `.slx` and `.mdl` files defeat ordinary code review. A diff shows that
the bytes changed and nothing about which blocks, parameters, or connections
moved. This project closes that gap with two components that share one report
format.

| Component | Runs where | Purpose |
| --- | --- | --- |
| GitHub Action | Pull-request CI | Find changed models, compare base and head, evaluate policy, publish deterministic reports |
| Copilot app canvas | Right side panel of a GitHub Copilot app session | Turn those reports into an interactive model review |

The Action produces the evidence. The canvas reads the same JSON for human
review. Neither one approves a pull request; branch protection and the policy
result stay authoritative.

## Quick start

Copy [the consumer workflow](samples/github-actions/canonical-pr.yml) into
`.github/workflows/simulink-model-drift.yml`:

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
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: samueltauil/simulink-model-diff@v0.3.1
        with:
          fail-on: error

      - if: always()
        uses: actions/upload-artifact@v7
        with:
          name: simulink-model-drift-${{ github.run_id }}
          path: build/model-drift
```

The `uses: samueltauil/simulink-model-diff@v0.3.1` step is the published
Action, downloaded by GitHub from the release tag. The checkout step fetches
the consumer repository's model history; it does not pull this repository.

Omit `rules` to use the package's built-in policy. If you set it, the path must
point to a YAML file in the consumer repository. Pin the full release commit
SHA when your supply-chain policy requires an immutable reference.

## Action inputs

| Input | Default | Description |
| --- | --- | --- |
| `base-ref` | PR base SHA | Base commit SHA or ref |
| `head-ref` | PR head SHA | Head commit SHA or ref |
| `include` | `**/*.slx`, `**/*.mdl`, `**/*.model.json` | Comma- or newline-separated model globs |
| `rules` | built-in policy | Repository-relative rules YAML path |
| `output` | `build/model-drift` | Report directory |
| `fail-on` | `error` | Policy level that fails the step (`none`, `warning`, `error`) |
| `extractor-command` | none | Command emitting one canonical manifest per artifact, with `{artifact}` as the path placeholder |
| `python-version` | `3.12` | Python version installed by `actions/setup-python` |

Outputs are `output`, `index-json`, `summary-markdown`, `sarif`, and
`exit-code`. `base-ref` and `head-ref` default to the pull request base and head
SHAs; outside a PR event, pass both explicitly. The Action requests no
permissions and uploads nothing by itself, so artifact and SARIF steps stay
under caller control.

## Report files

The Action compares the pull request base and head commits. It discovers added,
modified, deleted, and renamed model files, runs the configured semantic
extractor, compares canonical model manifests, and applies repository rules.

| File | Purpose |
| --- | --- |
| `model-drift-index.json` | Aggregate status and links to every changed model |
| `model-drift-summary.md` | Pull-request summary written to the Actions job |
| `model-drift.sarif` | Optional code-scanning findings |
| `models/*/model-drift.json` | Element-level drift for one model |
| `models/*/model-drift.md` | Human-readable report for one model |
| `models/*/model-drift.svg` | Portable visual summary |

Reports are still written when the policy gate fails, so reviewers can see why
the check was blocked.

## Review in the Copilot app

A passing check tells you the rules were satisfied. It does not tell you
whether the model change is right. That judgment happens in the canvas.

The extension is committed at
`.github/extensions/simulink-model-diff-canvas/`, the Copilot app's project
scope, so cloning the repository is the whole installation. Open an agent
session in the repository and ask for it:

```text
Open the Simulink Model Diff canvas for build/model-drift/model-drift-index.json
```

The canvas opens in the app's right side panel beside the conversation and
orders the review the way engineers run it. It states first whether extraction
was complete, partial, unsupported, or failed. It then lists the changed models
and draws only the blocks and connections the report records, pairs before and
after values with filters by category or model path, and ends with a merge
assessment derived from analysis status, policy status, and recorded drift.

Because it is an app canvas rather than a static file, the agent in the session
can drive it while you read. It can load another report, jump to a specific
model, or refresh after a new analysis run through the canvas capabilities
`load_report`, `select_model`, and `refresh`.

The canvas never opens the `.slx` file, calls the GitHub API, posts a review, or
changes a check result. See [the canvas guide](docs/copilot-canvas.md) for
inputs, capabilities, and troubleshooting.

## Fork pull-request safety

The supported automatic trigger is `pull_request`, never `pull_request_target`.

- The analysis job has only `contents: read`.
- Checkout disables persisted credentials and fetches full history so both PR commits are available.
- Fork PRs receive no repository secrets.
- The optional reusable workflow skips SARIF upload for fork PRs because their token cannot safely receive `security-events: write`.
- Reports still appear in the job summary and artifact for fork PRs.
- Automatic PR analysis runs only on a GitHub-hosted runner.

Do not route untrusted fork models to a self-hosted MATLAB runner. See
[Security](docs/security.md) and [Runner setup](docs/runner-setup.md).

## Reusable workflow wrapper

The optional reusable workflow at
`samueltauil/simulink-model-diff/.github/workflows/pr-analysis.yml@v0.3.1`
adds artifact retention and a separate fork-safe SARIF job around the same
Action. This is a workflow call at the job level, not the Action installation
syntax. See [GitHub Actions integration](docs/github-actions.md) for the
difference.

## Licensed `.slx` extraction boundary

The public PR workflow does not include MATLAB or Simulink. A semantic
extractor may require licensed MathWorks products, proprietary dependencies,
and model-controlled execution such as callbacks or custom code.

Use [the licensed runner example](samples/github-actions/licensed-slx.yml) only
as a manually dispatched, environment-approved workflow on an ephemeral,
dedicated runner. It must not run automatically for fork PRs and must not hold
deployment credentials. The checked-in extractor is a best-effort adapter and
has not been qualified across MATLAB and Simulink releases in this repository.

## Command line

The Action is a distribution wrapper around one command:

```bash
simulink-model-drift pr \
  --base-ref <sha> \
  --head-ref <sha> \
  --output build/model-drift \
  --include "models/**/*.slx" \
  --fail-on error
```

Add `--include` for each model glob and `--extractor-command "..."` when a
reviewed extractor is available. The command compares repository state at the
two refs; it does not require callers to prepare explicit file pairs.

Canonical JSON is the portable semantic contract beneath PR analysis. It is
useful for license-free CI, deterministic fixtures, and integrations that
produce manifests outside GitHub.

```bash
simulink-model-drift analyze \
  --base samples/canonical/controller-base.model.json \
  --target samples/canonical/controller-target.model.json \
  --rules samples/rules/default-rules.yml \
  --output build/model-drift \
  --fail-on none
```

The lower-level `analyze`, `compare`, `validate`, `doctor`, `schema`, and
`fingerprint` commands are documented in [the CLI guide](docs/cli.md).
Pair-oriented output names and contracts belong to those interfaces; PR
analysis uses the aggregate files listed above.

## Sample models

The [`samples/`](samples/) directory includes a cardiac digital twin scenario
based on the public
[`samueltauil/cardiac-digital-twin`](https://github.com/samueltauil/cardiac-digital-twin)
project, with reproducible MATLAB builder sources and canonical
baseline and target snapshots for the documented 50 mg to 60 mg beta-blocker
change. The sample is marked `partial` until a licensed Simulink extractor
qualifies the generated `.slx` artifact.

Open it directly in the canvas:

```text
Open the Simulink Model Diff canvas for samples/cardiac-digital-twin/drift.json
```

## Simulink `.slx` format basics

MathWorks documents `.slx` as a ZIP-based Open Packaging Convention package,
not a single XML document. The package typically contains a root
`[Content_Types].xml` manifest plus model and metadata members such as
`simulink/blockdiagram.xml`, `simulink/configSetInfo.xml`,
`simulink/stateflow.xml`, and `metadata/mwcoreProperties.xml`.

`simulink-model-drift inspect-slx <artifact>` validates that this package
structure is present and emits an inventory without claiming semantic
extraction. This is a bounded safety check: the file may be a valid Simulink
package while still needing an approved MATLAB or Simulink extractor to produce
a trustworthy canonical manifest.

## Capability boundaries

- Structural drift is not proof of behavioral equivalence.
- Raw SLX package inspection is bounded diagnostics, not semantic extraction.
- Complete semantic analysis requires a supported extractor and an explicit `analysis.status`.
- Partial, unsupported, or failed extraction remains visible and cannot become a clean "no drift" result.
- Rename and move detection may conservatively appear as removal plus addition.
- SARIF locations for model elements are less precise than source-code line annotations.

## Documentation

| Guide | Covers |
| --- | --- |
| [Getting started](docs/getting-started.md) | First run, from workflow to canvas review |
| [GitHub Actions integration](docs/github-actions.md) | Action inputs, outputs, and the reusable workflow |
| [Copilot app canvas](docs/copilot-canvas.md) | Install, open, and drive the review canvas |
| [CLI](docs/cli.md) | Every command and exit code |
| [Architecture](docs/architecture.md) | Pipeline stages and report contracts |
| [Security](docs/security.md) | Threat model, fork PRs, extractor trust |
| [Runner setup](docs/runner-setup.md) | Licensed MATLAB runner guidance |

## Project status

The comparison engine, reporters, Action, reusable workflow, and canvas are
implemented. The PR-native Action contract is published as `v0.3.1`. Consumers
should pin that release or a reviewed full commit SHA. See
[CHANGELOG.md](CHANGELOG.md) and [ROADMAP.md](ROADMAP.md).

## License

Released under the [MIT License](LICENSE). MATLAB and Simulink are separate
MathWorks products and are not included.
