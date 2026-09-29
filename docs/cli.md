# Python CLI and configuration

`simulink-model-drift analyze` automatically loads `model-drift/config.yml`
from the current working directory. `--config PATH` selects another file.
Command-line options override configuration, and the
`SIMULINK_DIFF_COMMAND` environment variable overrides
`extractor.command`. Configuration paths are resolved from the current
working directory.

The configuration model is strict: unknown fields, unsupported values, and
missing rule files are reported instead of being ignored. The supported
sections are:

- `extractor`: `strategy`, `command`, `timeoutSeconds`, and
  `failOnIncompleteAnalysis`.
- `comparison`: `identityStrategy` (`normalized-path`) and `inferMoves`
  (`false`).
- `reporting`: `outputDirectory` and any of `json`, `markdown`, `sarif`, or
  `svg` in `formats`.
- `policy`: rule-file paths and `warning`/`error` `failureLevels`.

Use `simulink-model-drift doctor --json` to check the active Python runtime,
package resources, configuration and rule paths, and whether the configured
semantic extractor executable can be resolved. It deliberately returns a
nonzero status when semantic extraction is not configured. It does not run
the extractor or claim that MATLAB/Simulink licensing is available.

The checked-in extractor command is:

```bash
python tools/run_matlab_extractor.py {artifact}
```

Use that exact value for `extractor.command`,
`SIMULINK_DIFF_COMMAND`, or `--extractor-command`. The launcher requires the
project package plus a separately installed and licensed MATLAB/Simulink
runtime. Static and contract tests do not establish live release compatibility.

For batch analysis, pass a YAML plan:

```yaml
schemaVersion: "0.1.0"
pairs:
  - id: controller
    base: canonical/controller-base.model.json
    target: canonical/controller-target.model.json
  - id: plant
    base: models/plant-base.slx
    target: models/plant-target.slx
    output: reports/plant
    failOn: warning
```

Plan input and per-pair output paths are relative to the plan file. When a
multi-pair plan omits `output`, reports are written beneath the configured
output directory in a subdirectory named for the pair ID.

## Stable exit codes

| Code | Meaning |
| ---: | --- |
| 0 | Successful, complete analysis with no policy failure |
| 1 | Readiness/inspection result is not ready or not complete |
| 2 | Invalid CLI input, configuration, rule file, JSON, or contract |
| 3 | Policy threshold was met |
| 4 | Reports were produced, but analysis was incomplete |
| 5 | Semantic extraction was unavailable or failed |

Use `--diagnostics-format json` before the subcommand, or set
`MODEL_DRIFT_DIAGNOSTICS=json`, for a stable diagnostic object containing
`code`, `message`, `exitCode`, and optional `context`.
