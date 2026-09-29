# Getting started

## 1. Add PR analysis

Copy [`examples/github-actions/canonical-pr.yml`](../examples/github-actions/canonical-pr.yml) to `.github/workflows/simulink-model-drift.yml`. Adjust `include` and `rules` for the repository, then pin the workflow to the reviewed release or commit SHA.

The workflow runs on `pull_request`, discovers changed models between the event's base and head SHAs, writes an aggregate job summary, and retains the complete report directory.

## 2. Add policy rules

Start with `model-drift/rules/default-rules.yml` or provide another repository-relative YAML file. `fail-on: error` blocks only error findings; `warning` blocks warning and error findings; `none` reports without enforcing.

## 3. Review outputs

| File | Purpose |
| --- | --- |
| `model-drift-index.json` | Aggregate status and per-model report index |
| `model-drift-summary.md` | Reviewer summary written to the job summary |
| `model-drift.sarif` | Aggregate policy findings |
| per-model report directories | Detailed evidence for each changed model |

Artifacts are uploaded even when policy fails. SARIF is optional and is skipped for fork PRs.

## Direct action use

Use the composite action when the repository needs custom surrounding steps:

```yaml
- uses: actions/checkout@v7
  with:
    fetch-depth: 0
    persist-credentials: false

- uses: samueltauil/simulink-model-diff@v0.3.0
  with:
    include: models/**/*.slx
    rules: model-drift/rules/default-rules.yml
    output: build/model-drift
    fail-on: error
```

The PR event supplies refs automatically. Pass `base-ref` and `head-ref` for `workflow_dispatch`, scheduled runs, or another event without PR SHAs.

## Licensed `.slx` analysis

Do not send fork PR content to a licensed self-hosted runner. Use a separate manual or environment-approved workflow for trusted refs, such as [`examples/github-actions/licensed-slx.yml`](../examples/github-actions/licensed-slx.yml). Qualify the extractor against the required MATLAB/Simulink releases and model dependencies before treating results as complete.

## Lower-level CLI

Install the package when GitHub Actions is not the execution environment:

```bash
python -m pip install simulink-model-drift
simulink-model-drift --version
```

The PR command accepts refs and model globs:

```bash
simulink-model-drift pr \
  --base-ref HEAD^ \
  --head-ref HEAD \
  --include "models/**/*.slx" \
  --rules model-drift/rules/default-rules.yml \
  --output build/model-drift \
  --fail-on error
```

Canonical pair comparison remains available through `analyze` for custom pipelines and fixture development. See [CLI and configuration](cli.md).
