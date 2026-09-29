# Security Policy

## Supported versions

This project is pre-1.0. Security fixes are applied to the latest release and the default branch. Older releases may not receive backports.

## Reporting a vulnerability

Use GitHub private vulnerability reporting for this repository when available. Otherwise, contact the maintainers through the private channel listed on the repository's Security page. Do not open a public issue for an unpatched vulnerability.

Include the affected version, deployment or runner context, reproduction steps, impact, and any suggested mitigation. Remove proprietary models, credentials, license data, and other sensitive material. Maintainers will acknowledge a complete report as soon as practical, coordinate validation and remediation privately, and credit reporters who want attribution.

## Scope

Relevant reports include unsafe handling of untrusted model content, command or path injection, archive expansion issues, secrets exposure, unsafe GitHub Actions permissions, misleading success on incomplete analysis, and report rendering vulnerabilities.

The analyzer does not make arbitrary `.slx` files safe to load. Model callbacks, initialization code, custom code, references, and dependencies can execute in MATLAB/Simulink environments. See [the threat model and runner controls](docs/security.md) before enabling semantic extraction.
