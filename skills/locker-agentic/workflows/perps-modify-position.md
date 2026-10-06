# Changing leverage, take profit and stop loss

```
Usage: lpa perps modify --symbol <S> [--leverage <n>] [--tp <p>] [--sl <p>] [--yes]
```

At least one of `--leverage`, `--tp`, `--sl`. Leverage applies to the market, take profit and stop loss to the open position. Refused while paper mode is on.

## 1. Read the position first

```sh
lpa perps positions
lpa perps quote --symbol ETH --side long --size 0.03 --leverage 2
```

Changing leverage changes the margin the position uses and moves the liquidation price. Quote the new leverage before proposing it, so the user sees where the liquidation lands. The policy caps the leverage (3 by default, `lpa policy show`): a higher one is refused.

## 2. Show, ask, wait

Show the current position, the new liquidation estimate, and what the margin becomes. Without `--yes`, the command answers `CONFIRMATION_REQUIRED` and changes nothing.

## 3. Once they have said yes

```sh
lpa perps modify --symbol ETH --leverage 2 --yes
lpa perps modify --symbol ETH --tp 2750 --sl 2600 --yes
lpa perps modify --symbol ETH --sl 2600 --yes
```

Through MCP: `perps_modify`, which runs only with `confirm: true` and the `quote_id` its refusal without `confirm` answered.

## What gets refused

| Code | Why |
|---|---|
| `BAD_ARGUMENTS` | None of `--leverage`, `--tp`, `--sl` given; or a TP or SL on the wrong side of the entry for that side; or no open position on that symbol. |
| `POLICY_REJECTED` | The policy allows less leverage than asked. It says the ceiling. Raising it is the user's call, and takes effect at their next `lpa unlock`. |
| `BAD_ARGUMENTS` | Paper mode is on. `lpa paper off` first, if the real account is what they meant. |
| `LOCKED` | The guardian holds no key. They run `lpa unlock`. |

## Setting protection at the start instead

`--tp` and `--sl` also exist on `lpa perps open` and `lpa perps quote`, which is the better place for them: the position is protected from its first second.

```sh
lpa perps open --symbol ETH --side long --size 0.03 --leverage 3 --tp 2750 --sl 2600 --yes
```
