# Contributing

Contributions are welcome for contracts, comparison behavior, rules, reports, documentation, fixtures, and supported extractor integrations.

## Development setup

Python 3.11 or newer is required:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[test]"
python -m pytest
python -m ruff check .
python -m build
```

Before opening a pull request, regenerate any affected samples with the documented CLI, run the focused tests, then run the full commands above. Do not hand-edit generated JSON, Markdown, SARIF, or SVG evidence.

## Design rules

- Preserve deterministic JSON serialization, ordering, paths, fingerprints, and report content.
- Treat `partial`, `unsupported`, and `failed` analysis as explicit outcomes; never turn uncertainty into a clean comparison.
- Keep undocumented SLX package XML outside the semantic contract.
- Add or update schema, compatibility, and golden fixtures when changing a public contract.
- Keep rules transparent and keep complete drift facts in JSON even when no rule matches.
- Avoid timestamps, runner paths, commit IDs, and other volatile values in deterministic outputs.

Semantic extractor contributions must use supported MathWorks APIs or documented comparison evidence, identify required products and releases, describe callback/dependency behavior, and include compatibility fixtures. Do not add proprietary models, generated code, or licensed MathWorks content unless redistribution is explicitly permitted.

## Pull requests

Keep changes focused and explain user-visible behavior, compatibility impact, and validation. Add an entry under `Unreleased` in `CHANGELOG.md` for user-visible changes. Breaking contract or action-input changes require a new major release.

By contributing, you agree that your contribution is licensed under the repository's MIT License.

For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
