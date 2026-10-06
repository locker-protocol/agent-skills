# Paper trading

The paper account fills on Hyperliquid's real order book, at the real prices, and counts the real fees. It needs no key, no vault and no guardian, and it works before `lpa init`. Offer it the first time a user asks for a trade.

It fills at the average price of the book it walks, which is the `entry` of the quote, not the worst price the order accepts. An order the visible book does not fill whole within the slippage bound is refused by name rather than filled at an invented price: lower `--size`, or raise `--max-slippage-bps`.

```sh
lpa paper init --budget 1000
lpa paper status
lpa paper on
lpa paper off
```

| Command | Flags | What it does |
|---|---|---|
| `lpa paper init` | `--budget <usd> [--reset]` | Opens the account. `--reset` starts it over. |
| `lpa paper status` | none | Equity, positions and fees, at live marks. |
| `lpa paper on` | none | Every perps command goes to the paper account until `lpa paper off`. |
| `lpa paper off` | none | Back to the real account. |
| `lpa paper record` | `[--top <n>] [--min-vlm <usd>] [--coins BTC,ETH]` | Records the market into a local tape: candles at 1 m, 5 m, 1 h and 4 h, and funding. |
| `lpa paper replay` | `--strategy <file.json> [--from <date>] [--to <date>] [--coins BTC,ETH]` | Replays a strategy file on that tape and says whether the evidence holds. |

Two ways to trade on paper: `lpa paper on` for the whole session, or `--paper` on a single `lpa perps open` or `lpa perps close`.

## A first trade, end to end

```sh
lpa paper init --budget 1000
lpa perps quote --symbol ETH --side long --size 0.005 --leverage 3
lpa perps open --symbol ETH --side long --size 0.005 --leverage 3 --paper --yes
lpa paper status
```

```
Paper account opened with $1000. Try: lpa perps quote --symbol BTC --side long --size 0.001 --leverage 2

LONG 0.005 ETH at 3x (market)
  entry        2692.7   (mid 2692.65, worst accepted 2773.4)
  notional     $13.46   margin $4.49
  fees         0.095% ($0.0128)
  liquidation  1831.7687   (estimate, this order alone, cross margin)
Paper order filled.

Paper equity $999.99 (budget $1000.00, realized $0.00, unrealized $0.00)
Fees paid: $0.0128 over 1 fills

SYMBOL  SIZE   ENTRY   MARK    PNL    LEV
ETH     0.005  2692.7  2692.7  $0.00  3x
```

Even here, quote first and show the quote. `--yes` still belongs to the user: without it the command answers `CONFIRMATION_REQUIRED`, with the message saying it is a paper order.

## What paper mode refuses

While `lpa paper on` is in force, `lpa perps modify`, `lpa perps cancel`, `lpa perps deposit`, `lpa perps withdraw` and `lpa perps transfer` are refused, so nothing reaches the real account by mistake. `lpa perps positions`, `balance` and `orders` read the paper account and say so (`"paper": true`, and `"address": "paper"`).

A paper order fills at once or not at all, so `lpa perps orders` in paper mode answers that there is no paper order.

## Reading the paper account without turning the mode on

`lpa perps positions`, `lpa perps balance` and `lpa perps orders` take `--paper` too, the way `lpa perps open` and `lpa perps close` do, so a user who traded with `--paper` alone can read what it did without a vault account. `--paper` and `--address` are mutually exclusive. Without either, and with no vault account set up, the refusal is `NOT_INITIALIZED` and its hint names `--paper` when a paper account exists.

## What happens to a position it keeps

The paper account is one cross-margin pot, and two things happen to a position it holds, checked at every read and every fill:

- **Funding.** Every complete hour a position is held is charged at the market's hourly funding rate: a long pays a positive rate, a short is paid it. `lpa paper status` shows the running total beside the fees once there is one.
- **Liquidation.** When the equity at the marks falls under the maintenance margin the positions hold together (the position value over twice the maintenance leverage of its margin tier, the same formula as the quote's liquidation estimate), every position is closed at its mark, the loss is realized, `lpa paper status` says so and a `liquidation` entry goes to `lpa journal`. Before this the paper account was never liquidated at all, so a high-leverage strategy tried on paper came out flattered.

## Reading the numbers

```json
{
  "budgetUsd": 500, "cashUsd": 500, "equityUsd": 500,
  "unrealizedPnlUsd": 0, "realizedPnlUsd": 0, "usedMarginUsd": 0,
  "fills": 0, "positions": [], "feesUsd": 0
}
```

`feesUsd` is the total paid, on the same basis as a real order, which is why a paper result is comparable to a real one. In `lpa journal`, paper fees are listed line by line but left out of the period's total, and the journal says so.

## Copying a trader, on paper

```sh
lpa copy start --leader 0x0000000000000000000000000000000000000000 --budget 1000 --days 7
lpa copy start --leader 0x0000000000000000000000000000000000000000 --sizing fixed --fixed-margin 25
lpa copy status --all
lpa copy stop --all
lpa copy resume
```

Every order of that trader is mirrored on a paper account of its own, in the background, with the real fees. Nothing is signed and no funds move. `lpa copy resume` takes up the copies left paused after a restart. Only perps are copied; a spot trade of theirs is skipped and named as such.

How each opening is sized (`--sizing`):

| Mode | Opening | Its flag |
|---|---|---|
| `proportional` (default) | the trader's size times the copy's equity over theirs, never more than `--max-scale` times their size | `--max-scale`, 1 by default, 10 at most |
| `mirror` | the trader's own size | none |
| `percent` | a share of the copy's equity as margin | `--percent`, required |
| `fixed` | the same margin each time | `--fixed-margin`, required, the budget at most |

Whatever the mode, a reduction of the trader's is the same share of the copy's position, and every opening is held to the policy's largest order. After the live feed drops or the computer restarts, the trader's executions are read back first: a reduction is mirrored however late, an opening more than two minutes old is skipped as too late to chase (a `copy-skip` line in `lpa journal`, after a `copy-catchup` line saying what was read back).

## Replaying a strategy on the recorded market

A strategy is a JSON file of conditions and one order, never code. `lpa paper replay` walks the recorded tape minute by minute, places the order where the conditions hold, and settles it on the candles that follow, with the real fees and funding. Nothing is signed and nothing is sent.

```sh
lpa paper record
lpa paper record --coins BTC,ETH
lpa paper replay --strategy range-fade.json
lpa paper replay --strategy range-fade.json --from 7d --coins ETH
```

`lpa paper record` takes the 20 busiest markets of the main dex by default (BTC always among them), or exactly the markets `--coins` names. One call reaches a few days back on the 1 m candles; running it again later appends what is new and keeps what is there, so the tape grows over days. `--from` and `--to` take a duration back from now (`3d`), a day (`20260925` or `2026-09-25`) or a timestamp.

Through MCP the same two are `paper_record` (`top`, `min_vlm`, `coins`) and `paper_replay`, which takes the strategy as a JSON object instead of a path, since an agent has no file to point at: the server checks it with the same parser, writes it under the paper folder and gives the command the file. See [mcp.md](mcp.md).

An example strategy, the one the examples repository ships. Its numbers are round and illustrative, never measured:

```json
{
  "version": 1,
  "name": "range-fade",
  "comment": "AN EXAMPLE, NOT ADVICE.",
  "when": {
    "markets": { "top": 10 },
    "regime": ["Range"],
    "rsi14": { "min": 30, "max": 70 },
    "rangeWidthPct": { "min": 1, "max": 5 },
    "nearLevel": { "level": "support", "withinPctOfWidth": 25 },
    "minDayVolumeUsd": 5000000
  },
  "order": {
    "side": "fade",
    "sizeUsd": 100,
    "leverage": 2,
    "entry": { "type": "level", "offsetPct": 0.1 },
    "tp": { "rangeShare": 0.5 },
    "sl": { "outsidePct": 1 },
    "ttlHours": 6,
    "cooldownMinutes": 30,
    "maxRiskReward": 3
  }
}
```

| Field | What it says |
|---|---|
| `when.markets` | A list of markets, or `{ "top": n }` for the busiest ones. Every recorded market when absent. |
| `when.regime` | Any of `StrongBull`, `WeakBull`, `Range`, `WeakBear`, `StrongBear` (as `lpa perps regime` reads them). |
| `when.rsi14`, `when.rsi6` | `{ "min", "max" }` between 0 and 100. |
| `when.rangeWidthPct`, `when.nearLevel` | The 4 h range's width, and how close the price is to its support or resistance, as a share of the width. |
| `when.volumeRatio`, `when.minDayVolumeUsd` | Volume against its average, and the day's volume floor. |
| `order.side` | `long`, `short`, or `fade` (long near the support, short near the resistance). |
| `order.sizeUsd`, `order.leverage` | At least $10, the exchange's minimum; leverage 1 to 100. |
| `order.entry` | `{ "type": "market" }` or a limit resting at the level, `{ "type": "level", "offsetPct": n }`. |
| `order.tp`, `order.sl` | A percentage from the entry (`{ "pct": n }`), or tied to the range (`rangeShare`, `outsidePct`). |
| `order.ttlHours`, `order.cooldownMinutes`, `order.maxRiskReward` | How long a limit rests, the pause after a stop, the risk:reward ceiling (3 by default, `"never"` to drop it). |

A field the schema does not know is refused by its name, so a misspelt condition never passes for a true one.

### Reading the verdict

The replay is deliberately harsh: a resting limit fills only when a candle goes through its price, never on a touch; no take-profit on the candle that filled; a candle that reaches both the take-profit and the stop counts as a loss; trades cut off by the end of the tape are left out of the win rate. The report gives the costs under three slippage scenarios, what the same strategy would have done filled on a touch, why no order was placed, and each market.

Its last line is the verdict. **GATE CLEARED on this tape** needs at least 300 settled trades, and the 95 % lower bound of the win rate (Clopper-Pearson) above the win rate the costs require in the base scenario (10 bps of slippage when a take-profit fills, 30 when a stop does). Anything else reads **GATE NOT CLEARED**.

Report it as it is. A replay that has not cleared the gate proves nothing, whatever its win rate, and a replay that has cleared it describes the past tape, not the next trade. Never present a replay as a reason to open a real position, and never tune a strategy's numbers until the replay passes and then call it proven: that is fitting the past. The report is also written to `~/.lpa/paper/replay-latest.md`, and each trade to `~/.lpa/paper/trades-latest.jsonl`.
