# Getting started

## Product positioning

This project ships a proven, deterministic comparison workflow for reviewable model drift. The default supported path is canonical manifest comparison, which works without MATLAB or Simulink and is designed for CI and pull-request review.

The optional MathWorks integration path uses the checked-in first-party static extractor and intentionally requires a licensed MATLAB/Simulink environment. It must be validated against project-specific models and releases before production use.

## Choose an input path

The analyzer accepts either:

1. **Canonical JSON manifests** for a portable, license-free comparison and the primary product workflow.
2. **`.slx` artifacts** plus an external command that emits one valid canonical manifest per artifact for a separately controlled MathWorks-backed integration.

The repository includes `tools/run_matlab_extractor.py` and
`tools/matlab/extract_simulink_model.m`. They perform a documented-API static
pass and emit the canonical contract. This implementation has not been run
against licensed MATLAB in the repository's CI environment, so no release
compatibility claim is made. `inspect-slx` remains bounded ZIP/OPC package
diagnostics.

## Install and verify

```bash
python -m pip install simulink-model-drift
simulink-model-drift --version
```

Until a package is published, install a reviewed release archive or checkout:

```bash
python -m pip install .
```

## Compare canonical manifests

```bash
simulink-model-drift analyze \
  --base examples/canonical/controller-base.model.json \
  --target examples/canonical/controller-target.model.json \
  --rules examples/rules/default-rules.yml \
  --output build/model-drift \
  --fail-on error
```

The command always writes deterministic reports before returning a policy or completeness failure:

| File | Purpose |
| --- | --- |
| `model-drift.json` | Complete, schema-validated drift record |
| `model-drift.md` | Reviewer summary |
| `model-drift.sarif` | Actionable rule findings |
| `model-drift.svg` | Dependency-free visual summary |

Exit codes are `0` for success, `1` for a not-ready diagnostic/inspection result, `2` for invalid input/configuration, `3` when the selected policy threshold is reached, `4` for incomplete analysis, and `5` when semantic extraction is unavailable or fails. See [the CLI guide](cli.md) for diagnostics and configuration.

## Compare `.slx` artifacts

Your extractor command must accept an artifact path and emit exactly one canonical manifest JSON object to stdout. It must not mix logs with stdout. Use `{artifact}` where the path belongs:

```bash
simulink-model-drift analyze \
  --base build/base/controller.slx \
  --target models/controller.slx \
  --extractor-command "python tools/run_matlab_extractor.py {artifact}" \
  --rules model-drift/rules/default-rules.yml \
  --output build/model-drift
```

The same command can be run directly:

```bash
python tools/run_matlab_extractor.py models/controller.slx
```

The launcher validates the canonical schema, explicit analysis status, source
artifact SHA-256, and deterministic fingerprints before emitting the result.
Configure licensing and isolation before running model-controlled code; see
[Runner setup](runner-setup.md).

## GitHub adoption

Use the [composite action](github-actions.md) rather than copying package internals into a workflow. Start with canonical manifests on GitHub-hosted runners. Add a licensed semantic extraction job only after its trust boundary and runner controls are reviewed.

## Example adoption flow and review use case

An automotive braking controller team can nominate a base revision and a target revision, export each as canonical manifests, and review the resulting drift artifacts in CI before merge.

A realistic review sequence is:

1. trigger a PR workflow on every model change;
2. compare the canonical manifests and generate JSON, Markdown, SARIF, and SVG outputs;
3. review the interface and parameter deltas in the Markdown summary;
4. block merges when the rule threshold is exceeded for release-critical interfaces;
5. attach the manifests and artifacts to the release record or model review package.

This is the supported path for product review. The optional MathWorks semantic path can supplement the same evidence with deeper model interpretation only when the license, isolation, and trust requirements are satisfied.
