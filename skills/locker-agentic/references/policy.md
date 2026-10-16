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
    "maxRiskReward": 3,
    "expiresAt": null
  },
  "defaults": { "...": "the same fields, as they ship" }
}
```

`allowDexes: [""]` is the main dex. `allowSymbols: null` means any market on those dexes. `maxRiskReward: null` means the risk:reward guard is off.

When the user has signed a mandate with their wallet, the guardian also checks it before every opening, and what applies is the narrowest of the two: see [mandate.md](mandate.md). A `POLICY_REJECTED` may then name the mandate: the notional of the day, its end, a use it does not allow.

## Changing the limits

```sh
lpa policy set --max-order-usd 250
lpa policy set --max-leverage 5 --markets BTC,ETH
lpa policy set --markets any
lpa policy set --dexes main
lpa policy set --max-orders-per-day 10
lpa policy set --expires-in-hours 8
lpa policy set --expires-in-hours never
lpa policy set --max-risk-reward 2
lpa policy set --max-risk-reward never
lpa policy set --max-open-notional-usd 2000 --max-orders-per-hour 4
lpa policy set --order-types market,limit
lpa policy set --margin-modes isolated
```

| Flag | What it limits |
|---|---|
| `--max-order-usd <n>` | The notional of one order. |
| `--max-leverage <n>` | The leverage of an order. |
| `--dexes main,xyz` | Which dexes may be traded (`main` for the main one). |
| `--markets BTC,ETH` or `--markets any` | Which markets. |
| `--max-orders-per-day <n>` | How many orders in a day. |
| `--max-risk-reward <n>` or `never` | An order that carries both a take-profit and a stop-loss is refused when the stop is more than n times further from the entry than the take-profit. Orders without both are not checked. |
| `--expires-in-hours <n>` or `never` | When the policy itself stops allowing orders. |
| `--max-open-notional-usd <n>` or `never` | The notional held across every market. |
| `--max-market-notional-usd <n>` or `never` | The notional held on one market. |
| `--max-market-exposure-pct <n>` or `never` | The notional on one market, as a share of the equity. |
| `--order-types market,limit,trigger,limit-ioc,limit-alo` or `any` | Which orders: `limit` is a limit that rests (`--tif gtc`), `limit-ioc` an immediate-or-cancel one, `limit-alo` one posted to the book only. A policy of `limit` written before 2.4.0 allows neither of the last two until they are named. |
| `--max-price-deviation-bps <n>` or `never` | How far from the mid the price an order signs may be. |
| `--max-orders-per-hour <n>` or `never` | How many orders in sixty minutes. |
| `--margin-modes isolated`, `cross,isolated` or `any` | The margins an opening may set its leverage in: `isolated` refuses every opening in cross margin. |

The last seven are bounds of this computer only: absent until set, they do not enter the mandate signed by the user's wallet. An order that lowers what one of them weighs (a position reduced, a reduce-only order) always goes. A refusal names the bound as `POLICY_REJECTED`.

No stop in percent exists since `lpa` 2.4.0: no order is refused for what the account lost today or since the start, and no fall of the equity stops the daily pilot. `--max-daily-loss-pct`, `--max-total-loss-pct` and `--total-loss-base-usd` are still accepted and change nothing (the answer says so, and its JSON carries `retired`); never propose them. A `policy.json` written before reads as it is, those fields ignored.

**Tightening takes effect at once. Widening takes effect at the next `lpa unlock`**, which only the person can type. So you may narrow the limits when the user asks, and you may never widen them yourself: propose the line and let them run it. Raising `--max-risk-reward`, or setting it to `never`, is a widening.

When the guard refuses, the refusal gives the ratio: `The policy refuses this order: the stop-loss is 4.2x further from the entry than the take-profit (420 against 100), above the 3x allowed.` Move the stop closer or the take-profit further, and quote again; do not propose turning the guard off.

## What the policy never blocks

Closing a position and cancelling an order are always allowed, whatever the limits say. That is deliberate: a policy must never trap a user in a position.

## What the policy is not

It is a guard on what goes through `lpa`. It is not what stops the key from withdrawing. What stops that is Hyperliquid itself, which refuses `withdraw3`, `usdSend`, `spotSend`, `sendAsset`, `usdClassTransfer`, `approveAgent` and `approveBuilderFee` to an agent key, plus the guardian's closed list of trading actions, the key's expiry, and the dedicated account holding only what the user is ready to risk.

Say this plainly if a user asks how safe the setup is, instead of promising more than the policy does.
