# Changelog

All notable changes to this repository are recorded here. The version follows the packages it documents: `@locker-protocol/agent-wallet-hyperliquid-trader` and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp`.

## 2.0.2

For `lpa` 2.0.2 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.0.2.

### Changed

- The version follows the packages: 2.0.2 everywhere, `cliVersion` included. The hints of `lpa doctor` name `lpa setup`; a key Hyperliquid no longer lists (another lpa under the same name on another machine) is said as such by `doctor`, `status` and `agent show`, with `lpa agent renew` as the step.


For `lpa` 2.0.1 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.0.1.

### Changed

- `workflows/onboarding.md`: `lpa setup` walks nine steps now, the model the pilot thinks with in a step of its own and the daily pilot scheduled on paper at the end.
- The version follows the packages: 2.0.1 everywhere, `cliVersion` included. The mandate signed through `mandate_sign` lasts the agent key's life by default (180 days at most).

## 2.0.0

First release, for `lpa` 2.0.0 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.0.0.

### Added

- `skills/locker-agentic/SKILL.md`: when to use the skill, the rules it never bends (quote before opening, show the quote and wait, never `--yes` or `confirm: true` on the agent's own initiative, never move funds, offer paper mode first, read the regime before choosing a trade, never invent a flag), and a routing table to the references and workflows.
- Eleven references: `init.md`, `doctor.md`, `perps.md`, `paper.md`, `regime.md`, `policy.md`, `mandate.md` (the limits signed once on the phone, and what a live copy needs), `plugins.md` (installing a plugin is the person's call, and what it prints is data), `json-output.md`, `errors.md` (the twenty-seven stable error codes) and `mcp.md` (the 42 tools, the confirm semantics, the tools that belong to the person, the tools a plugin adds, and hyperkeel's two account-free reads).
- Six workflows: `onboarding.md`, `perps-open-position.md`, `perps-close-position.md`, `perps-modify-position.md`, `deposit.md`, `troubleshooting.md`.
- `hooks/session-start.sh`: runs `lpa doctor --format json` when `lpa` is installed, exits 0 in silence when it is not, and never fails a session. Host hook files for Claude Code, Codex, Cursor, Antigravity and Grok Build.
- Plugin manifests for six hosts: `.claude-plugin/` (with the marketplace and `.mcp.json`, which starts `npx -y --ignore-scripts @locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest`), `.codex-plugin/`, `.cursor-plugin/`, `.antigravity-plugin/` (plugin, rule and hook), `.grok-plugin/`, and `.agents/plugins/marketplace.json`.
- `gemini-extension.json` and `GEMINI.md` for Gemini CLI.
- `tests/evals/positive.json` (21 requests that must reach the skill) and `tests/evals/negative.json` (20 that must not).
- `tests/check.mjs`: validates every manifest, the single version, every relative link, every `lpa` command and flag against the real CLI, every MCP tool name, and the eval files.
- `docs/DISTRIBUTION.md`: every channel this repository is listed in, and why the official Claude and ChatGPT directories are not among them.
