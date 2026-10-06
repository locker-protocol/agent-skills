# Machine-readable output

Every command answers human text by default and JSON with `--format json`, or its short form `--json`. Use JSON whenever you are going to read the answer yourself; show the human form to the user.

```sh
lpa doctor --format json
lpa perps quote --symbol BTC --side long --size 0.001 --leverage 2 --json
lpa journal --since 24h --format json
```

`--format` takes `json` or `human`, nothing else.

## Success and refusal

On success, the top-level object is the command's own data: the shapes are in [perps.md](perps.md), [paper.md](paper.md), [policy.md](policy.md), [doctor.md](doctor.md) and [regime.md](regime.md). On a refusal, the process exits non-zero and prints one object:

```json
{ "error": { "code": "BAD_ARGUMENTS", "message": "--size is required." } }
```

`hint` is there when there is something to do next:

```json
{ "error": { "code": "NOT_INITIALIZED", "message": "No vault account is set up yet.", "hint": "Run `lpa init` and scan the sync QR of Locker Vault." } }
```

Test for `error` before reading anything else. The codes are in [errors.md](errors.md).

## Numbers are strings

Prices, sizes, notionals and fees come back as strings, already rounded to the market's tick and step, so that what you show is what goes out. Do not reformat them. Leverage, `minOrderUsd` and the boolean checks are numbers and booleans.

## The journal

```sh
lpa journal
lpa journal --since 24h --limit 50
lpa journal --since 20260929
```

`--since` takes a duration (`24h`), a compact date (`20260929`), a date or a timestamp. `--limit <n>` caps the lines.

```
TIME                 KIND   BOOK   SYMBOL  SIDE  SIZE   PRICE   FEES
2026-09-29 20:35:48  order  paper  ETH     long  0.005  2692.7  $0.0128
Fees paid over the period: $0.0000 (paper fees not counted)
```

```json
{
  "entries": [
    { "ts": 1790714299563, "kind": "order", "paper": true, "symbol": "ETH", "side": "long", "size": "0.005", "px": "2693.3", "notionalUsd": "13.47", "feeUsd": "0.0128" }
  ],
  "feesUsd": "0.0000",
  "skipped": 0
}
```

One line per action: quotes, orders, refusals of the policy, deposits, errors. `feesUsd` is the period's total and counts real orders only; when paper lines carry fees, the human output says so. This is what you read to answer "what did you do?".

## Exit codes

`0` when the command did what it was asked. Non-zero on any refusal, with the JSON object above on standard output. Progress lines for the person go to standard error, so a pipe reading standard output gets JSON and nothing else.
