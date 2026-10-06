# Troubleshooting

Start here, always:

```sh
lpa doctor --format json
lpa status --format json
```

`lpa doctor` signs nothing and needs no key. Each check carries a `detail` that names what to do. Read it and pass it on.

## `lpa` is not found

The skill never installs anything. Give the line and let the user run it:

```sh
curl -fsSL https://hyperagentictrader.com/agent-wallet-install.sh | sh
```

On Windows, in PowerShell: `irm https://hyperagentictrader.com/agent-wallet-install.ps1 | iex`. With Node 22.13 or later already present: `npm install -g @locker-protocol/agent-wallet-hyperliquid-trader@latest`.

## By code

| Code | Read it as | The line the user runs |
|---|---|---|
| `NOT_INITIALIZED` | No vault account here. | `lpa init` |
| `LOCKED` | The guardian holds no key, or a person is needed. | `lpa unlock` |
| `AGENT_EXPIRED` | The agent key reached its expiry. | `lpa agent renew` |
| `AGENT_NOT_APPROVED` | Hyperliquid does not list the agent. | `lpa doctor`, then `lpa init` |
| `PAPER_NOT_INITIALIZED` | No paper account. | `lpa paper init --budget 1000` (you may run this one) |
| `NEEDS_DEPOSIT` | Arbitrum is short of USDC or of ETH for gas. | Fund the address in the hint. See [deposit.md](deposit.md) |
| `HYPERKEEL_NOT_CONNECTED` | A hyperkeel tool that needs the account. | `lpa hyperkeel login` |
| `SERVICE_ERROR` | The around-the-clock service. | `lpa service status`, then `lpa service logs` |

The full table is in [../references/errors.md](../references/errors.md).

## Symptoms

**An order answers `CONFIRMATION_REQUIRED`.** Nothing is wrong. The command wants the user's go and there is no terminal here. Show the quote, ask, and add `--yes` only if they agree.

**An order answers `POLICY_REJECTED`.** The limits held. Show the reason and `lpa policy show`. You may tighten the policy when asked; widening it is the user's, and takes effect at their next `lpa unlock`.

**Everything answers `LOCKED`.** The guardian is not running or holds no key. `lpa status --format json` shows `guardian.running` and `guardian.unlocked`. The user runs `lpa unlock` in their own terminal; there is no password flag and no environment variable, on purpose.

**Orders go to the wrong book.** `lpa status --format json` gives `paperMode`. `lpa paper on` and `lpa paper off` switch it. In paper mode, `lpa perps modify`, `lpa perps cancel` and the three movements of funds are refused on purpose.

**`NETWORK_ERROR`, or the clock.** `lpa doctor` measures both whether `api.hyperliquid.xyz` answers and how far the clock has drifted. Nonces are timestamps, so a machine several seconds off gets its orders refused: the fix is the system clock, not a retry.

**`lpa perps orders` is empty in paper mode.** A paper order fills at once or not at all, so there is never a resting paper order.

**A market refuses everything.** `MARKET_HALTED` means it is not trading. `lpa perps markets` marks halted markets.

**A size is refused as too small.** `BELOW_MIN_ORDER`: Hyperliquid wants $10 of notional, and each market has a smallest step. The hint names the size to use.

## What never fixes anything

- Adding `--yes` or `confirm: true` on your own.
- Widening the policy on your own.
- Looking for another way to sign, another key, or an environment variable holding a password or a recovery phrase. There is none, and asking the user for one is a red flag they should refuse.
- Reinstalling to get past a refusal. Every refusal above is the design working.
