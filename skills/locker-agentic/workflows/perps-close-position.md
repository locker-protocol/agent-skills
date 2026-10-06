# Closing a position

Closing is always allowed by the policy, whatever the limits say. It still needs the user's go.

## 1. See what is open

```sh
lpa perps positions
lpa perps positions --all-dexes
```

```
SYMBOL  SIZE   ENTRY   VALUE   PNL     LIQUIDATION  LEV
ETH     0.005  2693.3  $13.47  $-0.00  -            3x
```

If nothing is open, say so and stop. Closing a symbol with no position answers `BAD_ARGUMENTS`.

## 2. Quote the close

```sh
lpa perps close --symbol ETH --dry-run
```

A close is a reduce-only market order in the other direction, so the dry run gives the same shape of quote as an open: entry and worst accepted price, notional, the fees as one total.

## 3. Show it and wait

Show the position, the PnL as `lpa perps positions` gives it, and the quote of the close. Then ask. Without `--yes`, the command answers `CONFIRMATION_REQUIRED` and signs nothing.

## 4. Close, once they have said yes

```sh
lpa perps close --symbol ETH --yes
```

| What they asked for | Line |
|---|---|
| The whole position | `lpa perps close --symbol ETH --yes` |
| Part of it, on the paper account | `lpa perps close --symbol ETH --size 0.02 --paper --yes` |
| Part of it, on the real account | `lpa perps open --symbol ETH --side short --size 0.02 --leverage 3 --yes`: the other side, as a new order, quoted and held to the policy; never more than the position, or it turns it around |
| Everything, every market | `lpa perps close --all --yes` |
| Tighter or looser slippage | add `--max-slippage-bps <n>` |
| On the paper account | add `--paper` |

`--all` and `--symbol` are mutually exclusive, and so are `--all` and `--size`: `--all` closes each position whole. On the real account `--size` is refused: a real close takes the whole position.

Through MCP: `perps_close` with `confirm: true` and the `quote_id` the same call without `confirm` answered, and `all: true` for every position.

**`--all` deserves a second question.** Say how many positions it will close and their total value before you run it, and take a yes on that number, not on the word "close".

## 5. Confirm

```sh
lpa perps positions
lpa journal --limit 5
```

Report what closed, the realized result and the fees as one total.

## Cancelling instead

An open order is not a position. To take back an order that has not filled:

```sh
lpa perps orders
lpa perps cancel --symbol ETH --order-id 123456789 --yes
```

The order id comes from `lpa perps orders`. Cancelling is always allowed by the policy.

## In paper mode

`lpa perps close --paper` and `lpa paper on` both work. `lpa perps cancel` is refused while paper mode is on, because a paper order fills at once or not at all, so there is nothing resting to cancel.
