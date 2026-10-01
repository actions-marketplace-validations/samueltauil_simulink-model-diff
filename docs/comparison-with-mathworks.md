# Compared with the MathWorks pull-request example

[Documentation index](README.md) | [Project README](../README.md)

The projects solve related problems at different layers.

The
[MathWorks example](https://github.com/mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests)
opens changed `.slx` models with the licensed Simulink Comparison Tool and
publishes HTML reports. It is the direct path when a team wants the official
visual comparison experience and can run MATLAB and Simulink in GitHub Actions.

Simulink Model Drift is a pull-request review system. It discovers model changes
from the exact base and head commits, produces stable machine-readable evidence,
applies policy, prioritizes the reviewer queue, and carries the same report into
the GitHub Copilot app. A qualified MathWorks-backed extractor can supply its
semantic evidence, but the review contract does not depend on one report format
or one runner topology.

## Practical differences

| Area | MathWorks example | Simulink Model Drift |
| --- | --- | --- |
| Primary goal | Generate official visual comparison reports | Control the review workflow from analysis trust through reviewer decision |
| Comparison engine | Licensed Simulink Comparison Tool through `visdiff` | Pluggable canonical extractor plus deterministic comparison contract |
| Runner | MATLAB and Simulink on self-hosted or licensed GitHub-hosted runners | Read-only GitHub-hosted analysis by default; licensed extraction is an explicit trusted path |
| Git range | Branch compared with `origin/main` | Exact base and head refs supplied by the event or caller |
| Model changes | Modified `.slx` files; new models are skipped by the example script | Added, modified, deleted, and renamed `.slx`, `.mdl`, or canonical model files |
| Outputs | HTML comparison reports | Aggregate and per-model JSON, Markdown, SVG, SARIF, and a structured review plan |
| Review order | Reviewer opens each report | Models are ranked as blocked, high, normal, or low priority with a recommended next step |
| Policy | No separate policy contract in the example | Repository rules, stable findings, failure thresholds, and SARIF |
| Incomplete evidence | Depends on MATLAB execution and report generation | `complete`, `partial`, `unsupported`, and `failed` remain explicit and fail closed |
| Review UI | Portable HTML report | GitHub Actions summary plus an interactive GitHub Copilot app canvas |
| Permissions | Workflow owns its runner and artifact upload | The Action requests no permissions; artifact and SARIF upload remain caller controlled |

The comparison above is based on revision
[`6b00057`](https://github.com/mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests/tree/6b0005788f105ad4f0ec138336e3b4d2d89ded0a)
of the MathWorks repository.

## Review planning

An HTML diff answers, "What changed in this model?" A large pull request first
needs to answer, "What should I review first, and what prevents approval?"

Every aggregate report therefore contains a deterministic `reviewPlan`:

- `blocked` for failed or incomplete analysis and policy failures;
- `high` for interface, functional, or potentially functional drift;
- `normal` for other recorded semantic drift;
- `low` when no semantic drift was recorded.

Each model includes the reason and the recommended next action. The Action
exposes the aggregate state as `review-status`, the job summary uses the same
priority order, and the Copilot canvas presents that order in its model queue.
This keeps CI, artifacts, and the human review surface consistent.

## Use them together

These approaches are complementary. A team with licensed MATLAB infrastructure
can use supported MathWorks APIs to produce qualified semantic evidence, then
feed that evidence into this project's canonical contract for policy, SARIF,
review prioritization, and the Copilot canvas.

This repository does not claim that a source-derived or package-level result is
equivalent to the Simulink Comparison Tool. If qualified extraction is missing,
the report stays partial or unsupported and the review plan blocks approval.
