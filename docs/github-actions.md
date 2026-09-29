# GitHub Actions integration

The repository root is a composite action. It installs the released Python package from the action checkout and invokes the public `simulink-model-drift analyze` command. Consumers provide inputs and retain control over checkout, permissions, artifacts, summaries, and SARIF upload.

## Minimal caller

```yaml
permissions:
  contents: read

steps:
  - uses: actions/checkout@v7
    with:
      persist-credentials: false
  - id: drift
    uses: YOUR-ORG/simulink-model-drift@v0.2.0
    with:
      base: examples/canonical/controller-base.model.json
      target: examples/canonical/controller-target.model.json
      rules: examples/rules/default-rules.yml
      output-dir: build/model-drift
      fail-on: error
```

Replace `YOUR-ORG` and pin a full commit SHA when your supply-chain policy requires an immutable reference. Before 1.0, pin an exact release tag rather than assuming a stable major-version channel.

## Inputs

| Input | Required | Default | Meaning |
| --- | --- | --- | --- |
| `base` | yes | - | Base canonical JSON or `.slx` path |
| `target` | yes | - | Target canonical JSON or `.slx` path |
| `rules` | yes | - | Rules YAML path |
| `output-dir` | no | `build/model-drift` | Report directory |
| `fail-on` | no | `error` | `none`, `warning`, or `error` |
| `extractor-command` | for `.slx` | empty | Per-artifact canonical extractor command |
| `python-version` | no | `3.12` | Python installed by `actions/setup-python` |

## Outputs

The action exposes `drift-json`, `markdown`, `sarif`, `svg`, `drift-sha256`, and `exit-code`. Report paths remain deterministic. Exit code `3` means reports exist but policy failed; exit code `4` means reports exist but analysis was incomplete. See [the CLI contract](cli.md) for all stable exit codes.

Use `if: always()` for artifact and summary steps so evidence survives a policy failure. Upload SARIF only from a trusted event with `security-events: write`; artifacts are the portable fallback.

## Fork pull requests

Use `pull_request`, grant `contents: read`, do not expose secrets, and keep `persist-credentials: false`. Canonical JSON comparison can safely run on a GitHub-hosted runner under those constraints. Do not use `pull_request_target` to check out and execute fork code.

Licensed semantic extraction has a larger trust boundary. Do not automatically route fork pull requests to a self-hosted runner containing licenses, network access, credentials, or proprietary dependencies. Use a separate manually dispatched or environment-approved workflow such as [`examples/github-actions/licensed-slx.yml`](../examples/github-actions/licensed-slx.yml).

## Complete examples

- [`canonical-pr.yml`](../examples/github-actions/canonical-pr.yml) compares canonical manifests, preserves reports, and conditionally uploads SARIF.
- [`licensed-slx.yml`](../examples/github-actions/licensed-slx.yml) is manually dispatched and prepares base/target artifacts for a configured extractor on a reviewed self-hosted runner.

Copy the caller workflow, not the action implementation. Replace repository/action placeholders and pin action dependencies according to your policy.
