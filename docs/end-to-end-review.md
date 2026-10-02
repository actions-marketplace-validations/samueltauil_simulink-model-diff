# Review a model pull request

[Documentation index](README.md) | [Project README](../README.md)

Simulink model files are binary, so a normal Git diff cannot tell a reviewer
which model elements changed, whether the extraction is trustworthy, or which
other models depend on the change. Simulink Model Drift adds that review layer
without replacing repository policy or the official Simulink tools.

<p align="center">
  <img src="assets/copilot-canvas-review.png" alt="Real GitHub Copilot app session showing the Simulink Model Drift canvas beside the agent conversation" width="100%">
</p>

## Set it up

Add the published Action to a workflow that runs for model changes:

```yaml
- name: Analyze model drift
  id: drift
  uses: samueltauil/simulink-model-diff@v0.5.0
  with:
    fail-on: error
```

Use `actions/checkout` with `fetch-depth: 0`, then upload
`build/model-drift` with `if: always()`. The complete example is in
[`samples/github-actions/canonical-pr.yml`](../samples/github-actions/canonical-pr.yml).

For tests and quality checks, use the
[evidence-aware workflow](../samples/github-actions/evidence-aware-pr.yml).
It runs MATLAB tests, requires the resulting JUnit file, and imports SARIF from
other analysis tools.

Copy `.github/extensions/simulink-model-diff-canvas/` into repositories whose
reviewers will use the Copilot app canvas. The Action and canvas are separate:
CI creates the evidence, and the canvas reads it.

## Follow the pull request

### 1. Let CI build the review artifact

The Action compares the exact base and head commits. It discovers changed
models, evaluates policy, scans repository relationships, imports configured
evidence, and writes one aggregate review plan.

The artifact contains:

| File | Use |
| --- | --- |
| `model-drift-index.json` | Aggregate trust, impact, evidence, and review order |
| `model-drift-summary.md` | Pull request job summary |
| `model-drift.sarif` | Code scanning findings |
| `models/*/model-drift.json` | Element-level before and after evidence |
| `models/*/model-drift.svg` | Portable visual summary |

The workflow keeps these files when analysis or policy fails. A blocked result
should still explain what failed and what the reviewer needs next.

### 2. Download the artifact

Download it into a checkout that contains the canvas extension:

```bash
gh run download <run-id> \
  --name simulink-model-drift-<run-id> \
  --dir build/model-drift
```

Open the repository in the GitHub Copilot app and send:

```text
Open the Simulink Model Diff canvas for build/model-drift/model-drift-index.json
```

### 3. Read the canvas in reviewer order

Start with trust. `complete` means the configured extractor supplied the
required evidence. `partial`, `unsupported`, or `failed` cannot support a clean
approval.

Next, check scope. The repository scan identifies direct and transitive model
dependents, linked dictionaries, external data sources, unresolved references,
and cycles. This is structural context, not semantic proof.

Then inspect evidence. The canvas keeps four sources distinct:

| Evidence | Question it answers |
| --- | --- |
| Semantic model drift | Which interfaces, parameters, blocks, or connections changed? |
| Repository impact | Which saved models and data sources may depend on that change? |
| JUnit and SARIF | What did tests and quality tools report? |
| Policy | Does the pull request satisfy the repository's declared rules? |

The element ledger shows recorded before and after values. Filters let the
reviewer focus on functional, interface, or structural changes without losing
the extraction status.

### 4. Make the engineering decision

The merge assessment turns the evidence into a review prompt:

| Assessment | Reviewer action |
| --- | --- |
| Analysis unavailable | Fix the extractor or unsupported input |
| Qualified extraction needed | Run an approved MATLAB or Simulink extraction |
| Policy gate failed | Resolve the reported rule, test, or evidence failure |
| Reviewer decision required | Confirm behavior, dependent compatibility, and tests |
| No drift detected | Confirm the analysis is complete, then follow normal review policy |

The canvas does not approve the pull request, change a check result, execute a
model, or override branch protection.

## Watch the workflow

<p align="center">
  <a href="assets/copilot-canvas-demo.mp4">
    <img src="assets/copilot-canvas-demo.gif" alt="Simulink Model Drift workflow from GitHub Action installation through impact-aware review in the Copilot app" width="800">
  </a>
</p>

The 42-second video is a real screen recording of the GitHub Copilot app. It
shows the agent conversation beside the live canvas, the partial trust state,
the recorded `60` to `65` parameter change, and the qualified-extraction
decision. Nothing is composited or rendered over the application.

Select the preview to open the full MP4.

## Why this is different

The MathWorks
[Simulink Model Comparison for GitHub Pull Requests](https://github.com/mathworks/Simulink-Model-Comparison-for-GitHub-Pull-Requests)
uses the licensed Simulink Comparison Tool to publish official `visdiff`
reports. That remains the right source for a qualified visual comparison.

This project handles the GitHub review contract around that evidence:

- exact pull request base and head selection;
- explicit complete, partial, unsupported, and failed trust states;
- machine-readable JSON, Markdown, SVG, and SARIF;
- repository impact across direct and transitive dependents;
- JUnit and SARIF evidence federation;
- policy enforcement and reviewer prioritization;
- an interactive Copilot canvas that presents the result in review order.

The two approaches work together. A MathWorks-backed extractor can supply
qualified semantic evidence while this project carries it through policy,
impact analysis, CI artifacts, and human review.
