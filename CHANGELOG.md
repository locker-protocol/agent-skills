# Changelog

All notable changes to this repository are recorded here. The version follows the packages it documents: `@locker-protocol/agent-wallet-hyperliquid-trader` and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp`.

## 2.4.3

For `lpa` 2.4.3 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.4.3.

### Added

- **An expert's opinion on a market.** The skill answers "what do you think of this coin", "long or short", "a scalp on it", "the best coin to short now" and their kin, in any language, as an expert trader would: it reads the market first with `lpa perps analyze` and `lpa perps scan`, then gives its own trade plan (the side, the entry, the stop loss, the take profit, the risk/reward, a probability in percent, the horizon, what invalidates it), with the facts that weigh most and an offer to act, never a question back and never a refusal. Twenty-two kinds of question are under `skills/locker-agentic/opinions/`, each with what to read, how to reason and the answer's template, the same the assistant of `lpa` follows.

### Changed

- The version follows the packages: 2.4.3 everywhere, `cliVersion` included. The tools of the MCP server are the same 42 as in 2.4.2.

## 2.4.2

For `lpa` 2.4.2 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.4.2.

### Changed

- The version follows the packages: 2.4.2 everywhere, `cliVersion` included. Nothing else changes in the skill: the two corrections of 2.4.2 (Enter opens a browser extension's signing page under `LPA_NO_BROWSER`, and a guardian whose start fails is said as such on a machine under load) change no command, tool or answer the skill describes.

## 2.4.1

For `lpa` 2.4.1 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.4.1.

### Changed

- The pilot reference says that a ladder above the order bound is scaled down to it by the day, its steps keeping their proportions, and refused only when its first step then falls under Hyperliquid's $10 minimum.
- The version follows the packages: 2.4.1 everywhere, `cliVersion` included.

## 2.4.0

For `lpa` 2.4.0 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.4.0.

### Removed

- The stops in percent are gone from the policy reference, the doctor and status samples, the onboarding defaults and the perps reference: `lpa` 2.4.0 refuses no order for what the account lost today or since the start, and no fall of the equity stops the daily pilot; `--max-daily-loss-pct`, `--max-total-loss-pct` and `--total-loss-base-usd`, still accepted, change nothing. The skill says it once, under "No stop in percent", and never offers a loss percentage as a limit.

### Added

- Three ways to sign for the account: `lpa init --with vault|browser|mobile`, Locker Vault first as the safest, and `lpa signer show`, `use` and `forget`, in the setup reference, the onboarding and the deposit workflows; every line that said "signed on the phone" now says the user's wallet signs.
- Profiles: `lpa profile list`, `add`, `use`, `rename`, `remove`, `--profile <name>` on any command and `LPA_PROFILE`, in the setup reference; one server for assistants per profile in the MCP reference; the check accepts `--profile` as a global flag.
- The controls of an order: `--tif gtc|ioc|alo`, `--reduce-only` and `--margin cross|isolated` on `lpa perps quote`, `check` and `open` (`tif`, `reduce_only`, `margin` and `trigger_px` on `perps_quote` and `perps_open`), and `lpa perps check`, in the perps reference and the open and close workflows.
- The policy reference lists every bound of this computer, `--margin-modes` and the order types `limit-ioc` and `limit-alo` among them.
- An order at a trigger kept and filled on the simulation account (`lpa perps open --type trigger --paper`), listed by `lpa perps orders --paper` and cancelled by `lpa perps cancel --paper`, in the simulation reference and the troubleshooting workflow.
- A pilot reference, `references/pilot.md`: the strategies and the measure `lpa pilot strategy show` gives, always with its bounds and never one figure alone; nothing new in the agent's last 24 hours (`keyEnding`); a day the model does not answer (`model-down`, `lpa pilot model-down`); why a step does not rest (`refusedBy`); what a close filled in part left (`remaining`); the memory every account shares.
- `lpa notices`, off by default, in the doctor reference; `lpa copy start --at-end keep|close` (`at_end`); `lpa journal export --with-fills`.
- The error codes name `MANDATE_OUTDATED`: a mandate signed before 2.4.0, refused whole until the user signs a new one; the mandate reference names its state, `outdated`, and its fifteen fields under the version `2` of its domain. `AGENT_EXPIRED` also names a pilot's opening in the key's last 24 hours.

### Changed

- The setup reference gives the agent key's real span: 180 days by default, from 1 to 180.
- The version follows the packages: 2.4.0 everywhere, `cliVersion` included.

## 2.3.0

For `lpa` 2.3.0 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.3.0.

### Added

- A part of a real position closes with `lpa perps close --symbol <S> --size <base>` (and `perps_close` with `size`), reduce-only, never more than the position, at least Hyperliquid's $10; the workflow and the reference say so in place of `perps open` the other way.
- The plugins reference says a plugin's `source`, `author` and `repository`, the package's own words.
- `lpa doctor --egress` in the doctor reference: the register of the calls that left the computer, read only.
- The error codes name `SPEND_CEILING`: the day's spend on the model reached the ceiling the user set for the assistant, and nothing was asked of the model.
- The perps reference reads four more of the account's figures, none of which signs anything: `lpa perps fills` (the executions of a period), `lpa perps funding` (the funding paid and received), `lpa perps fees` (the rates the account pays) and `lpa perps ledger` (the movements of money). It says `--usd` in place of `--size`, `lpa perps close --at mid`, the order of `close --all`, and `lpa perps cancel --all`, whose `--dry-run` an agent may run; the cancel itself is on the user's word.
- `lpa doctor --files` in the doctor reference, read only; `lpa doctor --fix-modes` writes, so it is offered and the user runs it.
- The MCP reference says the user's switch of the server: `lpa mcp off`, under which every tool answers `CONFIRMATION_REQUIRED` with the reason, `lpa mcp on` and `lpa mcp status`. The plugins reference says `lpa plugins disable` and `enable`, the user's like installing.
- `lpa journal export --out <file>` in the skill's table, when the user asks for a file.

### Changed

- The version follows the packages: 2.3.0 everywhere, `cliVersion` included. The MCP server still has its 42 tools; `perps_close` takes its `size` on the real account too.

## 2.2.0

For `lpa` 2.2.0 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.2.0.

### Changed

- The daily pilot's charter names a strategy: `lpa pilot strategy list` and `lpa pilot strategy show --name <name>` read the strategies and change nothing, and `lpa pilot strategy choice --today` says what today would choose and writes nothing; an agent may run them. `use`, `save`, `remove`, `choice` with its options and `draft` change what the pilot plays: offer them, let the user run them. `draft` asks the model and writes only on the user's yes in their own terminal.
- The version follows the packages: 2.2.0 everywhere, `cliVersion` included. The 42 MCP tools are what they were.

## 2.1.0

For `lpa` 2.1.0 and `@locker-protocol/agent-wallet-hyperliquid-trader-mcp` 2.1.0.

### Changed

- One word for what is simulated: the skill, its eleven references and its six workflows say the simulation account and simulation mode where they said a paper or practice account, and so do the titles and descriptions of the MCP tools (`paper_init`, `paper_status`, `paper_on`, `paper_off`, `perps_positions`, `perps_balance`, `perps_orders`, `perps_open`, `perps_close`, `copy_start`, `copy_status`) and the server's own notes. Nothing of the interface moves: the tool names, their arguments, their answers and the 42 tools are what they were, `paper: true` included, and so are the `lpa` commands and flags the references name.
- `references/doctor.md`: the `paper` check reads "no simulation account (lpa paper init --budget 1000)", and the next step of a fresh computer says about five minutes, the time the way takes, as `lpa` says it.
- Commands an agent may now run, none of which signs or writes anything: `lpa perps check` quotes an order and says whether the limits let it through now, with the refusal `lpa perps open` would give; `lpa pilot plans` says what the daily pilot holds, market by market; `lpa pilot charter` reads the charter whole, and `lpa pilot charter --set <field>=<value> --preview` says the effect of a change without making it; `lpa pilot universe --show` reads back the universe last measured; `lpa mandate sign --preview` shows the mandate as it would be signed, and signs nothing; `lpa setup --facts` says where the guided setup stands. A quote now carries `minSize`, the smallest size that meets Hyperliquid's $10 minimum at the price the order signs, so a `BELOW_MIN_ORDER` can be answered with the size that passes.
- `lpa pilot deliberate --symbol <S>` plays one deliberation of the daily pilot on the simulation account and opens nothing, but it spends the model's tokens: offer it, let the user ask for it.
- The version follows the packages: 2.1.0 everywhere, `cliVersion` included.

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
