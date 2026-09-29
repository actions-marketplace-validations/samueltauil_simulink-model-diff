# Production and runner setup

## Canonical-only analysis

Canonical manifest comparison requires Python 3.11 or newer and no MATLAB license. A GitHub-hosted runner is sufficient. Use a clean checkout, read-only repository permissions, no secrets for fork pull requests, and artifact retention appropriate for model metadata.

## Semantic `.slx` extraction

The project does not bundle MATLAB or Simulink. It does include a first-party
static extractor at `tools/matlab/extract_simulink_model.m`, invoked by:

```bash
python tools/run_matlab_extractor.py path/to/model.slx
```

The implementation uses `load_system`, `find_system`, `get_param`, and
best-effort Stateflow APIs. It has not been run in this environment against a
licensed MATLAB installation. Each adopter must establish its supported
MathWorks release, products, license features, operating system, proprietary
dependencies, and fixture evidence.

Before enabling an extractor:

1. Validate it against redistributable fixtures for every supported saved-model and runtime release.
2. Record required products, optional products, unsupported features, and failure behavior.
3. Confirm whether callbacks, initialization scripts, custom code, referenced models, libraries, data dictionaries, and path setup execute.
4. Verify that stdout contains only the canonical JSON document and that diagnostics go to stderr.
5. Confirm deterministic output by extracting the same artifact twice in clean workspaces and comparing bytes and fingerprints.

## Self-hosted runner baseline

Prefer an ephemeral runner image or pool dedicated to model analysis. Give the runner:

- only the license access and repository read access it needs;
- no deployment credentials or persistent personal tokens;
- restricted outbound network access;
- a disposable workspace and bounded job timeout;
- reviewed MATLAB/Simulink startup state and search paths;
- resource limits for archive size, generated files, memory, and process duration;
- log and artifact controls suitable for proprietary model metadata.

Do not attach a privileged self-hosted label to an automatic fork pull-request workflow. Use manual dispatch, required environment reviewers, or another trusted promotion step. Treat same-repository branches as trusted only if branch creation and modification are appropriately restricted.

## Licensing

License availability is an operational prerequisite, not analyzer success. Document the license mechanism without committing license files, server credentials, or private hostnames. Test checkout and failure behavior before relying on CI. A missing product or license must produce `partial`, `unsupported`, or `failed`, never an empty `complete` manifest.

## Release compatibility evidence

For each supported configuration, retain:

- source model saved release and source SHA-256;
- extractor and analyzer versions;
- MATLAB/Simulink release and required products;
- load and callback policy;
- canonical schema/fingerprint versions;
- expected analysis status, warnings, and drift fixture;
- clean-run determinism result.

See [Security](security.md) for the full threat model.
