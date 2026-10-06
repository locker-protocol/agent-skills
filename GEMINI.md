# Locker Protocol Agentic

**Your private key is nowhere: not on our servers, not on the agent's machine, not with anyone.**

The agent trades. It holds nothing.

This extension adds the MCP server of Locker Protocol Agentic (`@locker-protocol/agent-wallet-hyperliquid-trader-mcp`, 42 tools over stdio) and the skill that says how to use it. The full skill is [`skills/locker-agentic/SKILL.md`](skills/locker-agentic/SKILL.md), with its references and workflows next to it. Read it before any Hyperliquid work.

## When this applies

Hyperliquid perpetual futures: a long or a short, leverage, a quote, a position, margin, liquidation, funding, open orders, closing, take profit or stop loss. Also paper trading, the market regime and the markets in a range, the local policy, the journal, copying a trader on paper, deposits to Hyperliquid, and any line starting with `lpa`.

Not for spot trading on other chains, token swaps, NFTs, other wallets or general coding.

## Rules, not negotiable

1. Always call `perps_quote` (command: `lpa perps quote`) before `perps_open`. Never open on a price you assumed.
2. Show the quote to the user and wait for their agreement before any real order: entry and worst accepted price, notional and margin, the fees as one total, the liquidation estimate. Never split that fee total.
3. Never pass `confirm: true`, and never add `--yes`, unless the user told you to in this conversation. Without them the answer is `CONFIRMATION_REQUIRED` and nothing is signed. That refusal is the design working. Through MCP, `confirm: true` also needs the `quote_id` the same call without `confirm` answered.
4. Never deposit, withdraw or transfer. Those tools sign nothing: they answer the exact line for the user to type in their own terminal, because Locker Vault signs on their phone. Hand it over and stop.
5. Offer paper mode on first use: `paper_init` with a budget fills on the real order book with the real fees, and needs no key and no vault.
6. Read `perps_regime` and `perps_ranges` before choosing between a trend trade and a range trade.
7. Never invent a flag or an argument. The tools and their arguments are listed in [`skills/locker-agentic/references/mcp.md`](skills/locker-agentic/references/mcp.md).

## Where things are

| Subject | File |
|---|---|
| The whole skill | [SKILL.md](skills/locker-agentic/SKILL.md) |
| The MCP tools and the confirm rule | [references/mcp.md](skills/locker-agentic/references/mcp.md) |
| Markets, quotes, orders | [references/perps.md](skills/locker-agentic/references/perps.md) |
| Paper trading | [references/paper.md](skills/locker-agentic/references/paper.md) |
| Regime and ranges | [references/regime.md](skills/locker-agentic/references/regime.md) |
| The local policy | [references/policy.md](skills/locker-agentic/references/policy.md) |
| Error codes | [references/errors.md](skills/locker-agentic/references/errors.md) |
| Setting up, and what only a person can do | [references/init.md](skills/locker-agentic/references/init.md) |

## What the agent can never do

See the recovery phrase (it is in Locker Vault, on the phone), see the agent key or its password (the key lives in the memory of a guardian the user starts), withdraw or send funds with the agent key (Hyperliquid refuses both), or get around the local policy (checked by the command and again by the guardian). A stolen agent key still cannot withdraw or send, but it can lose money, by trading and by paying the account into a Hyperliquid vault run by the thief, which Hyperliquid accepts from an agent key and only lpa's guardian refuses: the real bound is a dedicated account holding only what the user is ready to risk.
