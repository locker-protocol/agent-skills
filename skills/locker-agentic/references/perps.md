# Perps: reading the market and placing orders

One venue, Hyperliquid. `lpa perps venues` says so and nothing else. HIP-3 dexes are reached with `--dex <name>`, or all the funded ones with `--all-dexes`; without either, every command works on the main dex.

Every command below accepts `--format json` (or `--json`). Sizes are in the base asset (0.03 ETH), prices in USD, leverage a plain number.

## Reading

```sh
lpa perps markets --limit 10
lpa perps markets --search HYPE
lpa perps markets --all-dexes
```

```
SYMBOL  MARK     24H     FUNDING/H      VOLUME 24H   MAX LEV
BTC     83580.0  0.16%   0.0000125      $2135108478  40x
ETH     2692.6   0.43%   0.0000125      $1303373855  25x
```

Sorted by 24 h volume, halted markets marked. `--limit <n>` cuts the list, `--search <text>` filters it, `--dex <name>` picks one HIP-3 dex.

```sh
lpa perps positions
lpa perps balance --all-dexes
lpa perps orders
```

All three take `[--dex <name> | --all-dexes] [--address <0x...>]`. `--address` reads someone else's public positions; without it, the account's own (or the paper account's in paper mode).

`lpa perps balance` gives, per dex, the equity, what is withdrawable, the unrealized PnL and the number of positions. `lpa perps orders` lists open orders, triggers included, with the order id that `lpa perps cancel` needs. All three take `--paper` to read the paper account instead, and `--address <0x...>` to read somebody else's on chain; the two are mutually exclusive.

## The quote, always before the order

```sh
lpa perps quote --symbol ETH --side long --size 0.03 --leverage 3
```

```
LONG 0.03 ETH at 3x (market)
  entry        2670.4   (mid 2670.35, worst accepted 2750.5)
  notional     $80.11   margin $26.70
  fees         0.095% ($0.0761)   (base tier)
  liquidation  1816.5986   (estimate, this order alone, cross margin)
```

```json
{
  "symbol": "ETH", "dex": "", "side": "long", "type": "market",
  "size": "0.03", "leverage": 3, "maxLeverage": 25,
  "midPx": "2670.35", "entryPx": "2670.4", "worstPx": "2750.5",
  "notionalUsd": "80.11", "marginUsd": "26.70",
  "totalFeeRate": "0.095%", "totalFeeUsd": "0.0761",
  "marginMode": "cross", "feeTier": "base",
  "liquidationPx": "1816.5986",
  "minOrderUsd": 10, "meetsMinimum": true, "fillsWithinSlippage": true,
  "riskReward": null, "notes": []
}
```

The default policy allows $100 per order and a leverage of 3: 0.03 ETH at 3x fits, 0.05 ETH (about $134) would be refused with `POLICY_REJECTED`. Size an order from `lpa policy show` before quoting it.

`totalFeeRate` and `totalFeeUsd` are the whole cost of the order. Show them as one total. Never split them and never quote a part of them.

Flags: `--symbol --side long|short --size <base> --leverage <n>`, then `[--type limit --limit-px <p>]` for a limit order, `[--max-slippage-bps <n>]` to change the worst accepted price, `[--tp <p>] [--sl <p>]` for take profit and stop loss.

Read `meetsMinimum` (Hyperliquid refuses under $10 of notional), `fillsWithinSlippage` (the book cannot fill the size inside the slippage) and `notes` before showing the quote.

## Opening

```sh
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --dry-run
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --yes
```

The same flags as the quote, plus `[--dry-run] [--yes] [--paper]`.

- Without `--yes` and without a terminal, the command answers `CONFIRMATION_REQUIRED` and signs nothing. That is the normal path for an agent: show the quote, ask, and only then run it again with `--yes` because the user said so.
- `--dry-run` gives the quote plus the policy check and stops before any signature. Use it freely.
- `--paper` sends this one order to the paper account.
- The order is quoted, checked against the policy, then signed by the guardian, which checks the policy again.

## Closing

```sh
lpa perps close --symbol ETH --yes
lpa perps close --all --yes
lpa perps close --symbol ETH --size 0.01 --paper --yes
```

`(--symbol <S> [--size <base>] | --all) [--max-slippage-bps <n>] [--dry-run] [--yes] [--paper]`. Reduce-only, at market. Closing is always allowed by the policy, whatever the limits say. `--all` closes every position. A real close takes the whole position: `--size` closes part of it on the paper account only, and a real partial close is `lpa perps open` on the other side.

## Cancelling

```sh
lpa perps orders
lpa perps cancel --symbol ETH --order-id 123456789 --yes
```

`--symbol <S> --order-id <oid> [--yes]`. The order id comes from `lpa perps orders`. Always allowed by the policy.

## Modifying

```sh
lpa perps modify --symbol ETH --leverage 2 --yes
lpa perps modify --symbol ETH --tp 2750 --sl 2600 --yes
```

`--symbol <S> [--leverage <n>] [--tp <p>] [--sl <p>] [--yes]`. Leverage applies to the market and is held to the policy (3 by default), TP and SL to the open position. Refused in paper mode.

## Guards you will meet

- **$10 minimum** of notional per order, Hyperliquid's own: `BELOW_MIN_ORDER`.
- **Halted market**: no order goes out, `MARKET_HALTED`.
- **Margin**: `INSUFFICIENT_MARGIN` when the account cannot carry the position.
- **The local policy**: size per order, leverage, markets, orders per day, daily loss. See [policy.md](policy.md).
- Sizes are rounded to the market's step and prices to its tick before the quote, so the figures you show are the figures that go out.

## Movements of funds

`lpa perps deposit`, `lpa perps withdraw` and `lpa perps transfer` are signed on the phone by Locker Vault. See [../workflows/deposit.md](../workflows/deposit.md).
