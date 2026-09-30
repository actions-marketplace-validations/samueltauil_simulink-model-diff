# Runner setup

## Automatic pull-request analysis

Run the reusable PR workflow on `ubuntu-latest`. It needs Python and full Git history, but no MATLAB license when changed inputs are canonical manifests.

Required controls:

- `pull_request`, not `pull_request_target`;
- `contents: read` for analysis;
- `fetch-depth: 0`;
- `persist-credentials: false`;
- no secrets;
- no privileged network access;
- bounded workflow timeout and artifact retention.

The public PR workflow intentionally does not accept a self-hosted runner label.

## Licensed semantic extraction

MATLAB/Simulink extraction is a separate operational boundary. Models can invoke callbacks, initialization scripts, custom code, referenced projects, libraries, and proprietary dependencies. A license-bearing runner must never be the automatic destination for an untrusted fork PR.

Use a separate `workflow_dispatch` or environment-approved workflow for trusted refs. Prefer an ephemeral runner pool with:

- only required MATLAB/Simulink products and license access;
- no deployment credentials or persistent personal tokens;
- restricted outbound network access;
- a disposable workspace;
- reviewed startup files and search paths;
- explicit callback and dependency policy;
- size, time, memory, and generated-file limits;
- sanitized logs and artifacts.

The example [`licensed-slx.yml`](../samples/github-actions/licensed-slx.yml) uses a protected environment and dedicated labels. Adapt it only after validating how the selected extractor loads models.

## Compatibility evidence

For each supported configuration, retain:

- source model saved release and SHA-256;
- analyzer and extractor versions;
- MATLAB/Simulink release and licensed products;
- callback, custom-code, and dependency policy;
- expected analysis status and warnings;
- repeated-run determinism evidence.

A missing product, dependency, or license must produce `partial`, `unsupported`, or `failed`, never an empty `complete` result.
