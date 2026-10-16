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

All three take `[--dex <name> | --all-dexes] [--address <0x...>]`. `--address` reads someone else's public positions; without it, the account's own (or the simulation account's in simulation mode).

`lpa perps balance` gives, per dex, the equity, what is withdrawable, the unrealized PnL and the number of positions. `lpa perps orders` lists open orders, triggers included, with the order id that `lpa perps cancel` needs. All three take `--paper` to read the simulation account instead, and `--address <0x...>` to read somebody else's on chain; the two are mutually exclusive.

```sh
lpa perps fills --since 24h --symbol ETH
lpa perps funding --since 7d
lpa perps fees
lpa perps ledger --since 30d
```

Four more reads, from Hyperliquid, which sign nothing. `lpa perps fills` gives the executions of a period (`--since`, `--until`, `--symbol`, `--limit`): the price, the size, the fees in one total, the result realized, with the totals of the period. `lpa perps funding` gives the funding the positions paid and received, hour by hour, positive when paid, by market and in total. `lpa perps fees` gives the rates the account pays, taking from the book and resting on it, each one total, its tier and its volume. `lpa perps ledger` gives the movements of money of a period (thirty days by default): deposits, withdrawals, sends and transfers between dexes, with their fees and hashes. Each takes `--address <0x...>` and `--paper`; the simulation account moves no money, and `ledger` says so.

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

Flags: `--symbol --side long|short --size <base> --leverage <n>` (or `--usd <dollars>` in place of `--size`: the size is the dollars at the price quoted, rounded down to the market's step, and the answer says it under `fromUsd`), then `[--type limit --limit-px <p>]` for a limit order or `[--type trigger --trigger-px <p>]` for an entry trigger (a market order that waits until the price reaches it, a long's above the mid and a short's below, with no `--tp` or `--sl`: set them with `lpa perps modify` once it fires), `[--max-slippage-bps <n>]` to change the worst accepted price, `[--tp <p>] [--sl <p>]` for take profit and stop loss.

### The controls of an order

```sh
lpa perps quote --symbol BTC --side short --size 0.001 --leverage 2 --type limit --limit-px 84000 --tif alo
lpa perps quote --symbol ETH --side short --size 0.01 --leverage 3 --type limit --limit-px 2800 --reduce-only
lpa perps quote --symbol ETH --side long --size 0.03 --leverage 3 --margin isolated
```

| Flag | What it does |
|---|---|
| `--tif gtc\|ioc\|alo` | With `--type limit` only: `gtc` (the default) rests until it fills or is cancelled, `ioc` fills what the book holds up to the limit at once and cancels the rest, `alo` is posted to the book only. An `alo` limit that would cross the book (note `alo-crosses`) and an `ioc` limit that would not fill (note `ioc-no-fill`) are refused before anything is signed. |
| `--reduce-only` | The order only reduces the position held: the other side, never more than the position, no `--tp`, `--sl` or trigger. It sets no leverage, takes no margin, and the policy lets it through as a close; it does not count in the day's orders. |
| `--margin cross\|isolated` | The margin the leverage is set in. A market that takes isolated only refuses `cross`; a market where a position is open keeps that position's margin. |

The quote says `tif`, `reduceOnly` when asked, and `marginMode`. Hyperliquid sets a leverage for the whole market: when a position is held there, a note says so (`leverage-whole-market`). Each note has its code in `noteCodes`, in the order of `notes`.

Read `meetsMinimum` (Hyperliquid refuses under $10 of notional), `fillsWithinSlippage` (the book cannot fill the size inside the slippage) and `notes` before showing the quote.

## Checking an order against the limits

```sh
lpa perps check --symbol ETH --side long --size 0.03 --leverage 3
```

The quote, plus whether the policy and the mandate let the order through now. It signs nothing and writes nothing: use it freely, alongside the quote. It takes the flags of the quote, and `--paper`.

## Opening

```sh
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --dry-run
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --yes
```

The same flags as the quote, plus `[--dry-run] [--yes] [--paper]`.

- Without `--yes` and without a terminal, the command answers `CONFIRMATION_REQUIRED` and signs nothing. That is the normal path for an agent: show the quote, ask, and only then run it again with `--yes` because the user said so.
- `--dry-run` gives the quote plus the policy check and stops before any signature. Use it freely.
- `--paper` sends this one order to the simulation account. A simulated order fills at once or not at all, except an entry trigger (`--type trigger --paper`): that one waits for its price and fills at its trigger once the mark reaches it, judged by the policy when it is posted and again when it fills. See [paper.md](paper.md).
- The order is quoted, checked against the policy, then signed by the guardian, which checks the policy again.

## Closing

```sh
lpa perps close --symbol ETH --yes
lpa perps close --all --yes
lpa perps close --symbol ETH --size 0.01 --paper --yes
```

`(--symbol <S> [--size <base>] [--at market|mid [--wait <s>]] | --all) [--max-slippage-bps <n>] [--dry-run] [--yes] [--paper]`. Reduce-only, at market. Closing is always allowed by the policy, whatever the limits say. `--all` closes every position, the largest exposure first, and says what each close gives back. `--size` closes part of it, reduce-only, on the simulation account and on the real account: never more than the position, and on the real account at least Hyperliquid's $10. `--at mid` rests a reduce-only limit at the mid, then after the wait cancels it and closes what is left at market, so the close always ends closed.

## Cancelling

```sh
lpa perps orders
lpa perps cancel --symbol ETH --order-id 123456789 --yes
```

`--symbol <S> --order-id <oid> [--yes] [--paper]`. The order id comes from `lpa perps orders`. Always allowed by the policy. With `--paper` (or in simulation mode), it cancels an entry trigger waiting on the simulation account, by its number from `lpa perps orders --paper`.

```sh
lpa perps cancel --all --dry-run
```

`--all [--symbol <S>] [--with-stops] [--dry-run]` cancels every resting order, of every funded dex or of one market, one row each; the stops and targets of open positions stay unless `--with-stops`. `--dry-run` lists them and cancels nothing: use it freely, and run the cancel itself only on the user's word.

## Modifying

```sh
lpa perps modify --symbol ETH --leverage 2 --yes
lpa perps modify --symbol ETH --tp 2750 --sl 2600 --yes
```

`--symbol <S> [--leverage <n>] [--tp <p>] [--sl <p>] [--yes]`. Leverage applies to the market and is held to the policy (3 by default), TP and SL to the open position. Refused in simulation mode.

## Guards you will meet

- **$10 minimum** of notional per order, Hyperliquid's own: `BELOW_MIN_ORDER`.
- **Halted market**: no order goes out, `MARKET_HALTED`.
- **Margin**: `INSUFFICIENT_MARGIN` when the account cannot carry the position.
- **The local policy**: size per order, leverage, markets, orders per day, risk:reward, and the bounds the user set (notional held, orders in an hour, order types, margin modes, distance from the mid). No share of a loss refuses an order. See [policy.md](policy.md).
- **The controls**: a validity on a market order or a trigger, `cross` on a market that takes isolated only, a margin other than the position's, a reduce-only order with nothing to reduce or that would add: `BAD_ARGUMENTS` or a refusal by name, before anything is signed.
- Sizes are rounded to the market's step and prices to its tick before the quote, so the figures you show are the figures that go out.

## Movements of funds

`lpa perps deposit`, `lpa perps withdraw` and `lpa perps transfer` are signed by the user's wallet: Locker Vault on the phone, or their extension or mobile wallet. See [../workflows/deposit.md](../workflows/deposit.md).
