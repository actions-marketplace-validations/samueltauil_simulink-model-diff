# Getting started

[Documentation index](README.md) | [Project README](../README.md)

## 1. Add the published Action

Copy [`samples/github-actions/canonical-pr.yml`](../samples/github-actions/canonical-pr.yml) to `.github/workflows/simulink-model-drift.yml`. Adjust `include` and `rules` for the repository, then pin the workflow to the reviewed release or commit SHA.

The workflow checks out the consumer repository and runs
`samueltauil/simulink-model-diff@v0.4.2` from the published release. It
discovers changed models between the event's base and head SHAs, writes an
aggregate job summary, and retains the complete report directory.

## 2. Add policy rules

The workflow uses the package's built-in rules by default. To apply repository
policy, set `rules` to a YAML file that exists in the consumer repository.
`fail-on: error` blocks only error findings; `warning` blocks warning and error
findings; `none` reports without enforcing.

## 3. Check the Action result

| File | Purpose |
| --- | --- |
| `model-drift-index.json` | Aggregate status and per-model report index |
| `model-drift-summary.md` | Prioritized reviewer plan written to the job summary |
| `model-drift.sarif` | Aggregate policy findings |
| per-model report directories | Detailed evidence for each changed model |

Artifacts are uploaded even when policy fails. SARIF is optional and is skipped for fork PRs.

The policy result answers whether the pull request meets the configured rules.
It does not replace engineering review of the model change.

The job summary orders models by reviewer urgency. Failed or partial analysis
and policy failures are blocked, interface or functional drift is high
priority, other semantic drift is normal, and models without recorded semantic
drift are low priority. The Action exposes the aggregate state as
`review-status`.

## 4. Review the change in the Copilot app

Download the artifact from the workflow run into a repository checkout that
contains the canvas extension. The sample workflow names the artifact
`simulink-model-drift-<run-id>`.

```bash
gh run download <run-id> \
  --name simulink-model-drift-<run-id> \
  --dir build/model-drift
```

For this repository, the review canvas already exists under
`.github/extensions`. In another repository, copy
`.github/extensions/simulink-model-diff-canvas/` there first. Open a GitHub
Copilot app session in the repository and ask:

```text
Open the Simulink Model Diff canvas for build/model-drift/model-drift-index.json
```

The canvas opens in the app's right side panel. It reports analysis
completeness first, then the changed models, then before/after evidence, and
finally a merge assessment. Treat that assessment as review guidance, not as a
replacement for the Action check or branch protection.

Reports generated locally open from the same default path without the download
step. See [the canvas guide](copilot-canvas.md) for installation details.

The PR event supplies refs automatically. Pass `base-ref` and `head-ref` for
`workflow_dispatch`, scheduled runs, or another event without PR SHAs.

## Licensed `.slx` analysis

Do not send fork PR content to a licensed self-hosted runner. Use a separate
manual or environment-approved workflow for trusted refs, such as
[`samples/github-actions/licensed-slx.yml`](../samples/github-actions/licensed-slx.yml).
Qualify the extractor against the required MATLAB and Simulink releases and
model dependencies before treating results as complete.

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
  --output build/model-drift \
  --fail-on error
```

Canonical pair comparison remains available through `analyze` for custom pipelines and fixture development. See [CLI and configuration](cli.md).
