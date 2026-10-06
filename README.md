# Locker Protocol Agentic: agent skills

**Your private key is nowhere: not on our servers, not on the agent's machine, not with anyone.**

The agent trades. It holds nothing.

- **Where the key is:** the account's private key stays in Locker Vault, an offline app on a phone or tablet. The computer only holds an agent key, sealed under a password, that expires on its own (six months by default, the longest Hyperliquid allows).
- **Who can withdraw:** only the vault, by a QR code a person scans and signs. Hyperliquid refuses the agent key every withdrawal and every send; the one movement of funds it accepts from that key is a deposit into a Hyperliquid vault, which lpa never signs (measured on mainnet, 2026-09-28).
- **What goes where:** Hyperliquid for orders and reads, public Arbitrum nodes for deposits and balances, hyperkeel.com only when one of its tools is called. No server of ours, no account, no telemetry.

**Documentation:** [doc.lockerprotocol.com/agent-wallet](https://doc.lockerprotocol.com/agent-wallet/agent): install, the setup in steps, how it trades and every command. **Website:** [hyperagentictrader.com](https://hyperagentictrader.com).

This repository is the skill that teaches an AI agent to use `lpa`, the command of [Locker Protocol Agentic](https://github.com/locker-protocol/agentic) (`@locker-protocol/agent-wallet-hyperliquid-trader`), and its MCP server (`@locker-protocol/agent-wallet-hyperliquid-trader-mcp`). It is packaged as a plugin for Claude Code, Codex, Cursor, Antigravity, Grok Build and Gemini CLI. The plugin ships the skill, a session-start hook that runs `lpa doctor --format json`, and the MCP server pinned to `@locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest`.

## What the skill does

| | |
|---|---|
| Skill | [`skills/locker-agentic/SKILL.md`](skills/locker-agentic/SKILL.md) |
| References | [`skills/locker-agentic/references/`](skills/locker-agentic/references/): the setup, the doctor, perps, paper trading, the market regime, the policy, the JSON output, the error codes, the MCP tools |
| Workflows | [`skills/locker-agentic/workflows/`](skills/locker-agentic/workflows/): onboarding, opening, closing and modifying a position, depositing, troubleshooting |
| Hook | [`hooks/session-start.sh`](hooks/session-start.sh): runs `lpa doctor --format json` when `lpa` is on the PATH, exits 0 in silence when it is not, never fails a session |
| MCP server | [`.mcp.json`](.mcp.json): `npx -y --ignore-scripts @locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest`, 42 tools over stdio |

With the skill loaded, an agent quotes before it opens, shows the quote and waits, trades on paper until the user asks for the real account, and hands every movement of funds back to the user's phone.

## Install

The `lpa` command is separate from the skill, and the skill never installs it. On macOS and Linux:

```sh
curl -fsSL https://hyperagentictrader.com/agent-wallet-install.sh | sh
```

On Windows (PowerShell):

```powershell
irm https://hyperagentictrader.com/agent-wallet-install.ps1 | iex
```

Or, with Node 22.13 or later already installed:

```sh
npm install -g @locker-protocol/agent-wallet-hyperliquid-trader@latest
```

### Claude Code

```
/plugin marketplace add locker-protocol/agent-skills
/plugin install locker-agentic@locker-protocol
```

Local development: `claude --plugin-dir /path/to/agent-skills`.

### Any host with the skills CLI

```sh
npx skills add locker-protocol/agent-skills
```

### Codex

```sh
codex plugin marketplace add locker-protocol/agent-skills
codex plugin add locker-agentic@locker-protocol
```

Codex skips a plugin's hooks until you review and trust them. The MCP server is added separately, in `~/.codex/config.toml`:

```toml
[mcp_servers.locker]
command = "npx"
args = ["-y", "--ignore-scripts", "@locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest"]
```

### Cursor

Open **Customize > Plugins**, add from Git `https://github.com/locker-protocol/agent-skills`, and enable **locker-agentic**. The MCP server goes in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "locker": { "command": "npx", "args": ["-y", "--ignore-scripts", "@locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest"] }
  }
}
```

### Antigravity

```sh
agy plugin install https://github.com/locker-protocol/agent-skills
```

Install the repository root, so `skills/` and `hooks/session-start.sh` are on the plugin path. The MCP server goes in Antigravity's `mcp_config.json`, with the same two lines as Cursor.

### Gemini CLI

```sh
gemini extensions install https://github.com/locker-protocol/agent-skills
```

[`gemini-extension.json`](gemini-extension.json) starts `npx -y --ignore-scripts @locker-protocol/agent-wallet-hyperliquid-trader-mcp@latest` and loads [`GEMINI.md`](GEMINI.md), which points at the same skill.

## The rules the skill follows

These are written into the skill and are not negotiable:

1. **Quote first.** `lpa perps quote` (or `perps_quote`) before any `lpa perps open`. No exception.
2. **Show the quote and wait.** The entry and worst accepted price, the notional and margin, the fees as one total, the liquidation estimate. The user agrees before any real order.
3. **`--yes` and `confirm: true` belong to the user.** The agent never adds either on its own. Without them, `lpa perps open` answers `CONFIRMATION_REQUIRED` and signs nothing. Through MCP, `confirm: true` is taken only with the `quote_id` of the quote the user was shown.
4. **No movement of funds without agreement.** Deposits, withdrawals and transfers are signed on the user's phone anyway: the agent gives the line to type and stops there.
5. **Offer paper mode on first use.** `lpa paper init --budget 1000` fills on the real order book with the real fees, needs no key and no vault, and works before `lpa init`.
6. **Reading the market is free.** `lpa perps regime --symbol BTC` and `lpa perps ranges` tell a trending market from one in a range, and the agent is expected to read them before it proposes a trend trade or a range trade.
7. **Never invent a flag.** Every flag is in the command's own `--help`.

## Privacy Policy

The skill is a set of Markdown files. It collects nothing, sends nothing and stores nothing. The hook it ships runs one local command, `lpa doctor --format json`, and passes its summary to the host as session context; it writes no file and reaches no network of its own.

The `lpa` command and the MCP server run on your computer and keep what they know in the `lpa` folder (`~/.lpa`, or `LPA_HOME`): the settings, the sealed agent key, the paper account and the journal. There is no account with us, no analytics and no telemetry. They talk to:

- Hyperliquid (`api.hyperliquid.xyz`, HTTPS and WebSocket): market data, your account's reads, and the orders you confirm;
- public Arbitrum nodes (`arb1.arbitrum.io`, `arbitrum-one-rpc.publicnode.com`, `arbitrum.drpc.org`): your balances, and the deposits you sign on your phone;
- hyperkeel.com, our market data service, only when one of its tools is called. The brief and the leaderboard are read without an account: hyperkeel counts these calls per day and per client name (for example `locker-mcp/2.0.2`), and that count keeps no IP address and nothing personal. Follows and alerts use the hyperkeel account you connect with `lpa hyperkeel login`.

Nothing else leaves your computer. The full policy: https://lockerprotocol.com/privacy-policy/

## Checking this repository

```sh
node tests/check.mjs
LPA_BIN=/path/to/lpa node tests/check.mjs
```

[`tests/check.mjs`](tests/check.mjs) has no dependency. It validates every manifest and the paths it points at, that one version is used everywhere, that every relative link resolves, that every `lpa` command and flag written in the documentation exists in the real CLI, that every MCP tool name exists, and that [`tests/evals/positive.json`](tests/evals/positive.json) and [`tests/evals/negative.json`](tests/evals/negative.json) are well formed with no duplicate and no overlap. Without a `lpa` binary it says so and checks everything else.

## Where this repository is listed

See [`docs/DISTRIBUTION.md`](docs/DISTRIBUTION.md). Version history: [`CHANGELOG.md`](CHANGELOG.md).

## Licence

LOCKER PROTOCOL PROPRIETARY NON-COMMERCIAL LICENSE. See [`LICENSE`](LICENSE).
