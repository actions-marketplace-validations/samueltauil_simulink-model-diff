# Changelog

All notable user-visible changes are documented here. The project follows Semantic Versioning once public compatibility commitments are made; pre-1.0 releases may refine contracts with clear release notes.

## Unreleased

## 0.4.2 - 2026-10-01

### Changed

- Replaced the generic pull-request Marketplace icon with the `layers` icon to
  better represent hierarchical Simulink model review.
- Updated package, Action, reusable workflow, sample, and documentation
  references to the `v0.4.2` release.

## 0.4.1 - 2026-10-01

### Changed

- Published the public Action release after opening the repository to GitHub
  Marketplace consumers.
- Updated the Action, reusable workflow, package metadata, and documentation
  references to the `v0.4.1` contract.

## 0.4.0 - 2026-09-30

### Added

- Deterministic aggregate review plans that rank each changed model as blocked,
  high, normal, or low priority and provide a reason and next action.
- `review-status` outputs on the published Action and reusable workflow.
- A grounded comparison with the MathWorks pull-request model comparison
  example, including complementary adoption guidance.

### Changed

- Made the published root Action (`samueltauil/simulink-model-diff@v0.4.0`)
  the primary installation example. The reusable workflow remains available as
  an optional wrapper for artifact retention and fork-safe SARIF upload.
- Ordered the GitHub Actions summary and Copilot canvas model queue by reviewer
  priority so incomplete evidence and policy failures appear first.

## 0.3.1 - 2026-09-29

### Fixed

- The published reusable workflow now uses built-in policy rules when callers
  omit `rules`. Custom rules remain supported when the path exists in the
  consumer repository.

## 0.3.0 - 2026-09-29

### Added

- PR-native composite action around `simulink-model-drift pr`, with GitHub-context ref defaults, include globs, aggregate report outputs, and automatic job-summary rendering.
- Reusable `workflow_call` PR analysis workflow with full-history checkout, report artifact upload, and a separately permissioned, fork-safe optional SARIF job.
- Minimal consumer and manually approved licensed-runner samples.
- Project-scoped GitHub Copilot app canvas extension for aggregate PR indexes and
  individual model drift reports, with model selection, color-coded
  before/after evidence, and the agent-callable `load_report`, `select_model`,
  and `refresh` capabilities.

### Changed

- Reframed the product, onboarding, architecture, security, and runner guidance around automatic pull-request model drift analysis.
- Replaced pair-oriented action inputs and outputs with the published `v0.3.0` PR contract. This is a breaking action-interface change from `v0.2.0`.
- Updated first-party GitHub Actions dependencies to their Node.js 24-compatible v7 releases.
- Reworked the Copilot app canvas as a technical review station with a dark model
  queue, light evidence workspace, instrument-style impact map, and compact
  before/after ledger. Sections size themselves from the report data, omit
  unavailable policy and metadata fields, distinguish absent values from
  unreported values, and list only explicit model connections rather than
  inferring a route from block order.
- Reframed the canvas around the pull-request review workflow: trust the
  extraction, establish impact, filter evidence, and reach a merge assessment.
  The review station now flags partial or failed analysis as a required next
  action instead of presenting every loaded report as decision-ready.

## 0.2.0 - 2026-09-29

### Added

- Reusable root composite action with deterministic report-path, digest, and exit-code outputs.
- Safe canonical pull-request and gated licensed-runner workflow samples.
- Product-grade README, roadmap, and release messaging that separate the proven canonical comparison workflow from the optional MathWorks semantic path.
- Setup, runner, GitHub Actions, release, support, contribution, security, and roadmap documentation.
- Issue forms and a tag-driven GitHub release workflow.
- Strict CLI configuration, batch plans, machine-readable diagnostics, version and doctor commands.
- A first-party static MATLAB extractor wrapper and script with contract validation and dry-run support.
- Packaged default policy rules for installed-wheel analysis without a checkout-local configuration.

### Changed

- Repository CI now exercises the same composite action surface that consumers use.
- Documentation now clearly states the supported release path, trust boundaries, adoption workflow, and honest limitations for MathWorks-backed semantic extraction.
- Valid partial semantic extraction now produces deterministic reports and exits with the documented incomplete-analysis status instead of being rejected as an extraction failure.
- Source distributions now include GitHub workflows, issue forms, documentation, samples, action metadata, and extractor tooling.

## 0.1.0 - 2026-09-29

### Added

- Canonical model and drift schemas.
- Deterministic comparison, rule evaluation, JSON, Markdown, SARIF, and SVG reporting.
- Canonical validation, fingerprinting, package diagnostics, and semantic extractor boundary.
- Controlled canonical samples and integration tests.
