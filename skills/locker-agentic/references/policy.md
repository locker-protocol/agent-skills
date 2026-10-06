# The local policy

`~/.lpa/policy.json` holds the limits every order is checked against: once by the command, and again by the guardian before it signs. An agent that goes through `lpa` or the MCP server cannot get around it.

```sh
lpa policy show
lpa policy show --format json
```

```
max order      $100
max leverage   3x
risk:reward    3x (the stop's distance from the entry, over the take profit's)
dexes          main
markets        any on those dexes
orders a day   20
daily loss     10% of the equity at the day's first opening (UTC)
expires        never
Closing and cancelling are always allowed.
```

```json
{
  "policy": {
    "version": 1,
    "maxOrderUsd": 100,
    "maxLeverage": 3,
    "allowDexes": [""],
    "allowSymbols": null,
    "maxOrdersPerDay": 20,
    "maxDailyLossPct": 10,
    "maxRiskReward": 3,
    "expiresAt": null
  },
  "defaults": { "...": "the same fields, as they ship" }
}
```

`allowDexes: [""]` is the main dex. `allowSymbols: null` means any market on those dexes. `maxRiskReward: null` means the risk:reward guard is off.

When the user has signed a mandate on the phone, the guardian also checks it before every opening, and what applies is the narrowest of the two: see [mandate.md](mandate.md). A `POLICY_REJECTED` may then name the mandate: the notional of the day, its end, a use it does not allow.

## Changing the limits

```sh
lpa policy set --max-order-usd 250
lpa policy set --max-leverage 5 --markets BTC,ETH
lpa policy set --markets any
lpa policy set --dexes main
lpa policy set --max-orders-per-day 10 --max-daily-loss-pct 5
lpa policy set --expires-in-hours 8
lpa policy set --expires-in-hours never
lpa policy set --max-risk-reward 2
lpa policy set --max-risk-reward never
```

| Flag | What it limits |
|---|---|
| `--max-order-usd <n>` | The notional of one order. |
| `--max-leverage <n>` | The leverage of an order. |
| `--dexes main,xyz` | Which dexes may be traded (`main` for the main one). |
| `--markets BTC,ETH` or `--markets any` | Which markets. |
| `--max-orders-per-day <n>` | How many orders in a day. |
| `--max-daily-loss-pct <n>` | The day's loss, realized plus unrealized, as a percentage of the equity at the day's first opening order (UTC day), not of the equity at midnight. |
| `--max-risk-reward <n>` or `never` | An order that carries both a take-profit and a stop-loss is refused when the stop is more than n times further from the entry than the take-profit. Orders without both are not checked. |
| `--expires-in-hours <n>` or `never` | When the policy itself stops allowing orders. |

**Tightening takes effect at once. Widening takes effect at the next `lpa unlock`**, which only the person can type. So you may narrow the limits when the user asks, and you may never widen them yourself: propose the line and let them run it. Raising `--max-risk-reward`, or setting it to `never`, is a widening.

When the guard refuses, the refusal gives the ratio: `The policy refuses this order: the stop-loss is 4.2x further from the entry than the take-profit (420 against 100), above the 3x allowed.` Move the stop closer or the take-profit further, and quote again; do not propose turning the guard off.

## What the policy never blocks

Closing a position and cancelling an order are always allowed, whatever the limits say. That is deliberate: a policy must never trap a user in a position.

## What the policy is not

It is a guard on what goes through `lpa`. It is not what stops the key from withdrawing. What stops that is Hyperliquid itself, which refuses `withdraw3`, `usdSend`, `spotSend`, `sendAsset`, `usdClassTransfer`, `approveAgent` and `approveBuilderFee` to an agent key, plus the guardian's closed list of trading actions, the key's expiry, and the dedicated account holding only what the user is ready to risk.

Say this plainly if a user asks how safe the setup is, instead of promising more than the policy does.
