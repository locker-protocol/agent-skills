# Reading the market: regime and ranges

Two read-only commands, no key and no account needed. They say how a market is trading and which markets move in a range. Read them before proposing a trade: a trend trade and a range trade are not the same trade, and the difference is measurable.

## `lpa perps regime --symbol <S>`

One market, read on its 1 h, 4 h and 5 m candles.

```sh
lpa perps regime --symbol BTC
```

```
BTC: weak bull, trend score +0.25
  EMA stack     -0.34, leaning down
  structure     uptrend: higher highs and higher lows on the 4 h candles
  momentum      5 m micro +1.00, slope +0.0003 %/min
  RSI           14: 53.4, 6: 51.2
  volatility    ATR 4 h 1.12% of price, contracting (-42.2%); 1 h over 4 h 0.50
  volume        0.57x the 24 h average, rising (+87.2%)
  age           this regime has held 4 h
```

```json
{
  "coin": "BTC",
  "trendScore": 0.2506,
  "microTrendScore": 1,
  "regime": "WeakBull",
  "atr4hPct": 1.1165,
  "atrRatio": 0.5026,
  "emaAlignment": -0.34,
  "structure": "Uptrend",
  "trendAgeHours": 4,
  "atrSlope": -0.4220,
  "rsi14": 53.39,
  "rsi6": 51.20,
  "volumeRatio": 0.5715,
  "volumeTrend": 0.8724,
  "trendSlope5m": 0.00032,
  "computedAt": "2026-09-29T20:35:59.470Z"
}
```

| Field | How to read it |
|---|---|
| `regime` | `StrongBull`, `WeakBull`, `Range`, `WeakBear`, `StrongBear`. |
| `trendScore` | From -1 to +1. Near zero is a market with no direction. |
| `emaAlignment` | How the moving averages are stacked. Positive leans up, negative leans down. |
| `structure` | `Uptrend`, `Downtrend` or neither, from the highs and lows of the 4 h candles. |
| `rsi14`, `rsi6` | Momentum, slow and fast. |
| `atr4hPct` | The 4 h range as a percentage of price: how much this market moves. |
| `atrSlope` | Positive when volatility expands, negative when it contracts. |
| `atrRatio` | 1 h over 4 h volatility. Below 1, the last hour is calmer than the day. |
| `volumeRatio`, `volumeTrend` | Volume against its 24 h average, and whether it rises. |
| `trendAgeHours` | How long this regime has held. A fresh regime is less reliable than an old one. |
| `microTrendScore`, `trendSlope5m` | The last few minutes: entry timing, not direction. |

Two honest limits: it describes the past, and a regime can change while an order is in flight. Say so rather than presenting it as a forecast.

## `lpa perps ranges`

Which markets are in a range now, over the last 4 hours.

```sh
lpa perps ranges --limit 10
lpa perps ranges --all-dexes
```

```
SYMBOL  RANGE%  VOL%  RANGINESS  SCORE  SUPPORT  RESISTANCE
ZEC     4.43    1.00  4.43       4.43   1378     1439.1
ETH     1.20    0.34  3.53       3.53   2669.5   2701.5
BTC     0.96    0.28  3.46       3.46   82880    83679
In a range now: ZEC, ETH, BTC (3 of 3 scanned).
```

`[--limit <n>] [--dex <name> | --all-dexes]`. Range width and volatility are percentages of price, ranginess is their ratio, and the score runs from 0 to 10, scoring 0 outside 0.5 % to 5 % of width. Markets whose candles fail to load are skipped and counted.

Support and resistance are the edges of the observed range, not guarantees.

## Using them

- Trending market (`StrongBull`, `StrongBear`, or `WeakBull`/`WeakBear` with a clear structure and expanding volatility): trade with the direction, stop loss beyond the last swing.
- Range (`Range`, or a high ranginess in `lpa perps ranges`): the edges are the support and resistance given, and the middle is where the trade has the worst odds.
- Regime fresh (`trendAgeHours` small) or volume thin (`volumeRatio` well under 1): say the reading is weak.

Then quote, show the quote and the reading together, and wait for the user.

## Market data from hyperkeel

`lpa hyperkeel brief` gives the state of the whole market in one answer: the movers, funding, liquidations and large trades. `lpa hyperkeel leaders` gives a Hyperliquid leaderboard (`--window day|week|month|allTime|roi`). Through MCP, `hyperkeel_brief` and `hyperkeel_leaders` need no account. On the command line, hyperkeel asks the user to connect once with `lpa hyperkeel login`, which is theirs to type. Following traders and setting alerts always needs that connection.
