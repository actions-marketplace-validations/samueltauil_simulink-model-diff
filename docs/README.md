# Documentation

[Project README](../README.md)

Use this index to find the shortest path for the task at hand.

## Start here

| Guide | Audience | Covers |
| --- | --- | --- |
| [End-to-end review](end-to-end-review.md) | Model teams | Complete pull request workflow, evidence types, benefits, and product boundaries |
| [Getting started](getting-started.md) | Repository maintainers | Install the Action, read the first result, and open the canvas |
| [GitHub Actions](github-actions.md) | CI maintainers | Inputs, outputs, permissions, reusable workflow, artifacts, and SARIF |
| [Copilot app canvas](copilot-canvas.md) | Model reviewers | Install the canvas, inspect evidence, and troubleshoot the panel |

## Design and safety

| Guide | Covers |
| --- | --- |
| [Architecture](architecture.md) | Repository comparison, report contracts, review planning, and surface boundaries |
| [Security](security.md) | Untrusted pull requests, checkout integrity, permissions, report safety, and canvas isolation |
| [Runner setup](runner-setup.md) | GitHub-hosted analysis and licensed MATLAB or Simulink extraction |
| [Compared with MathWorks](comparison-with-mathworks.md) | Product boundaries and a complementary integration path |

## Reference and maintenance

| Guide | Covers |
| --- | --- |
| [CLI and configuration](cli.md) | Commands, configuration, diagnostics, and exit codes |
| [Releasing](releasing.md) | Versioning, validation, tagging, and release assets |
| [Changelog](../CHANGELOG.md) | User-visible changes by release |
| [Roadmap](../ROADMAP.md) | Planned work and compatibility commitments |
| [Support](../SUPPORT.md) | Support scope and issue-reporting details |
| [Security policy](../SECURITY.md) | Vulnerability reporting |

## Samples

The [`samples/`](../samples/) directory contains:

- a complete GitHub Actions consumer workflow;
- a protected workflow for licensed extraction of trusted refs;
- canonical controller fixtures used by tests;
- a cardiac digital twin report for the Copilot canvas.

Read the [sample index](../samples/README.md) before treating source-derived
evidence as a qualified Simulink extraction.
