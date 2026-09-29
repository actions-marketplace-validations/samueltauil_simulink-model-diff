# Releasing

Releases distribute the Python package, root composite action, and reusable PR workflow as one product contract. A MathWorks semantic extractor remains an optional, separately validated integration that must meet the same release quality and security requirements before it is treated as a supported product capability.

## Supported release path

- Ship the Python package at a versioned release and keep the wheel and source archive available.
- Publish the composite action and `.github/workflows/pr-analysis.yml` from the same versioned tag.
- Verify that the reusable workflow self-reference resolves to that release's action contract.
- Treat canonical manifests, drift schemas, and report outputs as the product's durable contract.
- Keep MathWorks-specific semantic claims out of the release narrative unless they are explicitly validated and documented as licensed, supported integrations.

## Prepare

1. Move relevant `Unreleased` entries in `CHANGELOG.md` under the new version and date.
2. Update `project.version` in `pyproject.toml`.
3. Run:

   ```bash
   python -m pytest
   python -m ruff check .
   python -m build
   ```

4. Install the built wheel in a clean environment and run the canonical example.
5. Validate `action.yml`, the reusable workflow, and consumer examples.
6. Confirm documentation and example links resolve.

## Publish

Create and push a signed `vX.Y.Z` tag whose version exactly matches `pyproject.toml`. The release workflow verifies, tests, builds, runs the composite action, and creates a GitHub Release containing the wheel and source archive.

The workflow does not publish to PyPI. Add a separate trusted-publishing job only after the project name, publisher, environment protection, and ownership are configured.

For action consumers, publish immutable patch releases. The PR-native action contract first ships as `v0.3.0`; examples and consumers should pin that exact release or its full commit SHA. Introduce a movable compatibility tag only with an explicit compatibility policy.

## Compatibility

Changing action input/output names, exit-code meaning, schema contracts, report file names, or deterministic serialization may require a major release. Extractor compatibility claims require fixtures and must identify MATLAB/Simulink releases and products.
