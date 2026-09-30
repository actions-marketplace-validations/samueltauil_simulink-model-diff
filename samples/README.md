# Real-world sample models

This directory contains reproducible sample inputs for the analyzer and the
Copilot visual diff canvas.

## Cardiac digital twin

`cardiac-digital-twin/` is based on the public
[`samueltauil/cardiac-digital-twin`](https://github.com/samueltauil/cardiac-digital-twin)
project. The upstream project generates `CardiacDigitalTwin.slx`
programmatically and intentionally excludes the generated binary from Git.

This sample therefore includes:

- the upstream MATLAB model builder and parameter file;
- a baseline canonical snapshot;
- a target canonical snapshot representing the documented 20% beta-blocker
  dose increase from 50 mg to 60 mg;
- a ready-to-review drift report for the Copilot canvas.

The canonical snapshots are an evidence-preserving representation of the
documented model architecture. They are marked `partial` because they were
derived from the checked-in MATLAB builder rather than extracted by a licensed
Simulink runtime. Run the builder and the project extractor in MATLAB when a
runtime-qualified semantic manifest is required.

Open the visual review with:

```text
Open the Simulink Model Diff canvas for samples/cardiac-digital-twin/drift.json
```

## Controller

The existing controller fixture under `examples/canonical/` remains the small
deterministic regression sample. It is intentionally compact; the cardiac
sample is the richer, domain-realistic example for visual review.
