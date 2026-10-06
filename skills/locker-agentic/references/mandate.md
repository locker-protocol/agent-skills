# The mandate, and live copies

The mandate is the agent's limits signed once on the user's phone, in Locker Vault. The guardian checks it before every order it opens, on top of the local policy ([policy.md](policy.md)): what applies is the narrowest of the two. It never widens anything.

It carries the policy's bounds as they stood when it was signed, and what the policy has no word for:

- a ceiling on the notional opened per UTC day;
- the one recipient of the service fee, and its highest rate;
- what the agent key may be used for: orders from the agent, live copies of the traders it names, or both;
- the budget of all live copies together;
- an end, never after the agent's.

## Reading it

```sh
lpa mandate show --format json
```

`state` is `in force`, `ended`, `other agent` (signed for an agent that a renewal or a new `lpa init` replaced), `invalid`, `removed` (one was signed here and its file is gone), `older` (an older mandate was put back), `revoked`, or `none`. Only `in force` opens anything; `none` means no mandate was ever signed here and the policy alone bounds you, as before. In every other state, the guardian refuses by name until the user signs a new one: give them `lpa mandate sign` and stop there. `lpa status` says the same on its `mandate` line.

## Signing it is the user's

```sh
lpa mandate sign --max-notional-per-day 500
lpa mandate sign --copy-leaders 0x0000000000000000000000000000000000000000 --copy-budget 250 --days 7
```

The phone signs it, so give the user the line to type in their own terminal and stop there. Through MCP, `mandate_sign` answers that line (`CONFIRMATION_REQUIRED`). To change the policy's bounds in it, the user runs `lpa policy set` first.

## Revoking it

```sh
lpa mandate revoke
```

It only restricts, and it lasts: the revocation is written on this computer, so no guardian, this one or the next, opens anything under it or under any older mandate until the phone signs a new one. You may run it when the user asks. Closing positions stays allowed. Going back to the local policy alone is `lpa mandate release`, which asks the user's password: it is theirs to type, never yours.

## Live copies

```sh
lpa copy start --leader 0x0000000000000000000000000000000000000000 --budget 250 --live
```

A live copy mirrors a trader on the real account. It needs three things, and the refusal names the one missing:

| Missing | Code | What you do |
|---|---|---|
| The guardian's key | `LOCKED` | Ask the user to run `lpa unlock`. You cannot unlock. |
| A mandate naming this trader, with room in its copy budget | `POLICY_REJECTED` | Ask the user to sign one: `lpa mandate sign --copy-leaders <0x...> --copy-budget <usd>`. |
| Paper mode off | `BAD_ARGUMENTS` | Ask the user whether to turn it off (`lpa paper off`); a paper copy needs none of this. |

Each order of a live copy goes through the quote, the policy and the mandate like the user's own, and is written in the journal as `copy` (a reduction as `close`). Stopping it leaves the positions it opened on the account: say so, and offer `lpa perps close`; until they are closed the copy's budget stays counted in the mandate's copy budget. A reduction the guardian could not place (key locked, a refusal) is kept and tried again at each execution and every minute; `lpa copy status` says how many are still to place, and `lpa unlock` (the user's) lets them through. The user's own account cannot be copied live. Paper copies, without `--live`, sign nothing and need no mandate ([paper.md](paper.md)).
