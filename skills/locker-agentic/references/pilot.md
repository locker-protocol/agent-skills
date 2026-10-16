# The daily pilot: what you may read

The daily pilot trades on its own, one day at a time, in simulation unless the user put it live under a mandate that allows it. Arming it, scheduling it, choosing its strategy and ending what it holds are the user's gestures. You read it, and you give the user the line when they ask for one.

```sh
lpa pilot status
lpa pilot plans
lpa pilot day --list --days 7
lpa pilot strategy list
lpa pilot strategy show --name ladder-long
```

All five read and change nothing. Through MCP, `pilot_status` is the only pilot tool, and it reads.

## The strategies, and their measure

`lpa pilot strategy list` gives the strategies the pilot can play, the shipped ones and the user's, each in one sentence, and the one in use. `lpa pilot strategy show --name <name>` says what the trader is told of it, its figures under the charter in use, the smallest account it opens anything on, and what the policy and the mandate would refuse of it at an equity (`--equity <usd>`, 1000 by default).

Since 2.4.1 a ladder whose steps are above the order bound is not refused: the day scales the whole ladder down to the narrower of the policy's and the mandate's largest order, the steps keeping their proportions, and `show` gives the steps and the base stake it would play. It refuses only when the first step then falls under Hyperliquid's $10 minimum, and says so. Pass it on as it is given; a larger ladder needs a wider `--max-order-usd`, which is the user's to set.

Each shipped strategy carries the measure it was shipped with (`measure` in `--json`): from several starting days thirty days apart, in simulation on Hyperliquid's past candles and funding, no model and no order, the worst, the median and the best return, the worst fall, the trades, and the holding of the same markets over the same days. When you pass it on:

- give the whole range, never one figure alone, with its date, its markets and what it assumes of the entries;
- say that it is a measure of the past, not a promise;
- name the charter's figures that differ from those measured, which `show` gives as `measureEnvelope`;
- a strategy the user wrote carries no measure, and `show` says so: say it too.

Never quote a return from memory or from another page: the figures live in `lpa pilot strategy show`, read at the moment. `lpa pilot calibrate --strategy <name> --starts <n>` measures again; it is long and reads a lot from Hyperliquid, so offer it rather than run it.

## Two rules of the pilot, neither a stop on a loss

No fall of the equity stops the pilot since 2.4.0, and no loss percentage exists to set. What remains: the pause after losses in a row, the model's budget, the policy, the mandate, and the stops each strategy sets for itself.

- **Nothing new in the agent's last 24 hours.** A live day ends `key-ending`, no model asked; what is held is still followed. `lpa status --json` and `lpa pilot status --json` give `keyEnding`. Tell the user to run `lpa agent renew`; once renewed, the schedule plays the day again by itself.
- **A day the model does not answer opens nothing new.** When every call to the model failed, the day ends `model-down`; what is held is still followed, and `modelOutage` says when. A model that abstains is not an outage.

```sh
lpa pilot model-down
lpa pilot model-down --code
lpa pilot model-down --nothing
```

`lpa pilot model-down` alone reads the setting. `--code` lets the code's breakout rule decide in the model's place on such a day, on a strategy of that shape only (mode `stop`, `breakoutDays`, a trailing exit); `--nothing`, the default, opens nothing. Choosing is the user's: say what each does and let them type it. `--json` gives `fallback`, `codeFits` and `codeFitsWords` for the strategy in use.

## What the pilot holds

`lpa pilot plans` gives each plan, its strategy, and for a position built by steps on the real account whether each step rests on the venue (`resting`) or why it does not (`refused`, and `refusedBy`: `policy`, `minimum`, `funds`, `guardian` or `venue`). Pass on the reason as it is given.

```sh
lpa pilot end-grid --symbol BTC --preview
lpa pilot end-range --symbol ETH --preview
```

`--preview` says what ending a grid or a range would cost and give (`sinceArmed`, `closeEstimate`) and does nothing: run it when the user asks. Ending it (`--close` or `--keep`) is the user's gesture. After `--close`, a close the book filled only in part says what is left under `remaining` (`size`, `side`, `filledPct`): say it, and offer `lpa perps close` for the rest.

## The memory every account shares

With several profiles, the pilot's lessons with nothing of an account in them, and the notes and rules written with `lpa pilot notes --shared` and `lpa pilot rules --shared`, are read by every account. A line with an address, an amount, a size or a balance stays with its account. Writing one is the user's.
