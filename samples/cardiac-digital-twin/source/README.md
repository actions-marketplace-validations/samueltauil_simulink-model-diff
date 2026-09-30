# Upstream source

This directory contains the actual model-building source copied from
`samueltauil/cardiac-digital-twin` at commit
`b660962358a4fa19ab0aea059e96c9bba23ffa6c`, not only derived JSON snapshots:

- `create_cardiac_model.m` — programmatically builds `CardiacDigitalTwin.slx`;
- `cardiac_params.m` — loads the PK, Hill/Emax, physiology, and baroreflex
  parameters;
- `run_simulation.m` — runs the documented 50 mg versus 60 mg scenario;
- `startup.m` — sample-local adaptation of the upstream session initializer
  that adds this flattened source directory, loads parameters, and builds or
  loads the model;
- `LICENSE` — the upstream MIT license governing the copied source.

Run `startup` in MATLAB to generate the upstream `CardiacDigitalTwin.slx`
artifact. The generated binary is intentionally not checked in by the
upstream project, so this sample preserves the real builder sources and
license while keeping the repository portable.

The canonical JSON snapshots in the parent directory are derived evidence,
not replacements for these source files. They remain `partial` until a
licensed MATLAB/Simulink extractor produces a runtime-qualified manifest.

The three model files and `LICENSE` are byte-for-byte copies of the upstream
commit. Their Git blob IDs provide a lightweight provenance check:

| File | Upstream blob |
| --- | --- |
| `cardiac_params.m` | `e28fb910df6cf149628027aee0717420d6660f7f` |
| `create_cardiac_model.m` | `3c098984e53178635ebc24e6965b6f77cbd4ca3b` |
| `run_simulation.m` | `4dce0fd821c89559b2e296232aa9acd7cee0550e` |
| `LICENSE` | `7f900dad134cfed07f0686d8c3ce5ae7d1249e00` |
