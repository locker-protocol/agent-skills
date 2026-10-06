# Locker Protocol Agentic

This Antigravity (`agy`) plugin bundles the `locker-agentic` skill for the `lpa` command of Locker Protocol Agentic (`@locker-protocol/agent-wallet-hyperliquid-trader`) and its MCP server (`@locker-protocol/agent-wallet-hyperliquid-trader-mcp`).

When the user asks about Hyperliquid, perpetual futures, a long or a short, leverage, a quote, a position, margin, liquidation, funding, closing, take profit or stop loss, paper trading, a market's regime, copying a trader on paper, depositing to Hyperliquid, or any line starting with `lpa`, read `skills/locker-agentic/SKILL.md` and follow it. Do not invent `lpa` flags: every flag is in the command's own `--help`.

Never install or upgrade `@locker-protocol/agent-wallet-hyperliquid-trader` without asking the user first. Run `lpa doctor` before the first operation of a session.

Three rules the skill holds to, repeated here because they matter most:

- Always `lpa perps quote` before `lpa perps open`, show the quote to the user and wait for their agreement.
- Never add `--yes`, and never add `confirm: true`, unless the user said so in this conversation.
- Never deposit, withdraw or transfer. Those are signed on the user's phone by Locker Vault: give the line and stop.
