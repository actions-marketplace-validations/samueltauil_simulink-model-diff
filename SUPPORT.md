# Support

## Getting help

Use GitHub Discussions when enabled for setup questions, integration design, and general usage. Use an issue for a reproducible defect or documentation problem. Security vulnerabilities must be reported privately according to [SECURITY.md](SECURITY.md).

Include:

- project and Python versions;
- operating system and runner type;
- the exact command or action inputs;
- exit code and sanitized logs;
- whether inputs are canonical JSON or `.slx`;
- extractor name, MATLAB/Simulink releases, required products, and `analysis.status`;
- the smallest redistributable fixture, if available.

Do not attach proprietary models, credentials, license files, private runner details, or unredacted reports. Canonical manifests and reports can contain model names, paths, parameters, and interface details.

## Support boundaries

Community support covers the Python package, schemas, comparison engine, rules, reporters, and composite action. MATLAB, Simulink, license servers, self-hosted runner administration, and third-party semantic extractors are supported by their respective providers or maintainers.

`inspect-slx` is package diagnostics, not semantic extraction. A result from that command cannot establish model equivalence.
