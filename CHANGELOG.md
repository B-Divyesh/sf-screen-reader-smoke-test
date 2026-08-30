# Changelog

All notable changes follow [Semantic Versioning](https://semver.org/).

## Unreleased

- Preserve a native button's accessible name when it comes from a descendant
  image's alternative text, so an `alt` regression fails its checked-in
  announcement contract.
- Use a darker coral text token for `First difference` markers in local reports
  so mismatch reports meet the 4.5:1 text-contrast requirement.

## 0.1.0 — 2026-08-27

- Add the typed announcement-flow configuration and programmatic runner.
- Add the `announce-check` CLI, JSON mode, update mode, and local HTML report.
- Capture focus semantics and ARIA live-region mutations without form values.
- Capture the native accessible names of input buttons so value changes fail
  the checked-in transcript instead of producing a false match.
- Add explicit remote-target authorization and a no-telemetry documentation site.
- Keep every documentation link at least 44 CSS pixels tall, including inline
  legal-page links.
