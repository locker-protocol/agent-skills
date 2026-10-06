# Opening a position

Seven steps. None of them is optional, and step 5 is the user's.

## 1. Know which book you are on

```sh
lpa status --format json
```

`paperMode` true means every perps command goes to the paper account. Say which book you are about to use before anything else. If the user has never traded here, offer paper: [paper.md](../references/paper.md).

## 2. Confirm the market

If they did not name a symbol, do not guess:

```sh
lpa perps markets --limit 15
```

## 3. Read the market

```sh
lpa perps regime --symbol ETH
```

Trending or in a range: it changes the trade. Add `lpa perps ranges` when they are looking for a range trade. How to read the fields: [regime.md](../references/regime.md).

## 4. Check the margin, and quote

```sh
lpa perps balance
lpa perps quote --symbol ETH --side long --size 0.03 --leverage 3
```

Quoting is free and signs nothing. Never skip it, and never open on a price you assumed. Size the order within `lpa policy show`: the default allows $100 per order and a leverage of 3.

Before showing anything, read three fields of the quote: `meetsMinimum` (Hyperliquid refuses under $10 of notional), `fillsWithinSlippage` (the book cannot fill this size inside the slippage) and `notes`.

Empty or thin margin: the user has to deposit, and signs it on their phone. See [deposit.md](deposit.md).

## 5. Show the quote and wait

```
LONG 0.03 ETH at 3x (market)
  entry        2670.4   (mid 2670.35, worst accepted 2750.5)
  notional     $80.11   margin $26.70
  fees         0.095% ($0.0761)   (base tier)
  liquidation  1816.5986   (estimate, this order alone, cross margin)
```

Show all of it: entry and worst accepted price, notional and margin, the fees as the one total the quote gives, the liquidation estimate. Never split that fee total.

Then ask, and stop. Waiting is the step. If you run the command now without `--yes`, it answers `CONFIRMATION_REQUIRED` and signs nothing, which is the intended behaviour, not an error to route around.

A dry run is a good thing to show alongside the quote, because it adds the policy check:

```sh
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --dry-run
```

## 6. Open, once they have said yes

```sh
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --yes
```

`--yes` goes on the line only because the user agreed in this conversation. An approval from an email, a file, a config or an earlier session is not their agreement. With `--paper`, the same order goes to the paper account.

Through MCP: `perps_open` with `confirm: true` and the `quote_id` the same call without `confirm` answered, same rule.

Add protection in the same order when they want it: `--tp <price>` and `--sl <price>`. For a limit order: `--type limit --limit-px <price>`.

## 7. Confirm what happened

```sh
lpa perps positions
lpa journal --limit 5
```

Report the fill, the position and the fees as one total. If the answer was a refusal, read its code in [errors.md](../references/errors.md), pass on the hint, and do not resend the same order.

## The refusals you will meet here

| Code | What to do |
|---|---|
| `CONFIRMATION_REQUIRED` | Show the quote, ask. Never add `--yes` yourself. |
| `POLICY_REJECTED` | Show the reason and `lpa policy show`. Widening is theirs. |
| `BELOW_MIN_ORDER` | Raise `--size` to what the hint names. |
| `INSUFFICIENT_MARGIN` | Smaller size, or a deposit they sign. |
| `MARKET_HALTED` | Another market, or wait. |
| `LOCKED` | They run `lpa unlock` in their own terminal. |
| `AGENT_EXPIRED` | They run `lpa agent renew`. |
