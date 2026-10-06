# Error codes

Every refusal is a stable code, a sentence for the user, and a hint saying what to do. Codes are never renamed; a new situation gets a new code. React to the code, do not parse the sentence.

On the command line, a refusal exits non-zero and prints, with `--format json`:

```json
{ "error": { "code": "CONFIRMATION_REQUIRED", "message": "Paper long 0.005 ETH at 3x needs the user's go.", "hint": "Show the quote to the user; once they agree, run the same command with --yes." } }
```

Through MCP, the same three fields come back as a tool error.

| Code | What happened | What you do |
|---|---|---|
| `BAD_ARGUMENTS` | A flag is missing, out of range, or two flags conflict. | Read the message, fix the line. Run `lpa <command> --help` rather than guessing. |
| `UNKNOWN_COMMAND` | No such command. | `lpa --help` for the list. Never invent one. |
| `NOT_INITIALIZED` | No vault account is set up. | Tell the user to run `lpa init` themselves. Paper trading needs none of this. |
| `LOCKED` | The guardian holds no key, or is not running, or the step must be typed by a person. | Tell the user to run `lpa unlock` in their own terminal. An agent cannot unlock. |
| `AGENT_EXPIRED` | The agent key reached its expiry; Hyperliquid no longer accepts it. | Tell the user to run `lpa agent renew`: one QR scan approves a new agent. |
| `AGENT_NOT_APPROVED` | Hyperliquid does not list the agent, or the sealed key is gone. | `lpa doctor`, then `lpa init` again. |
| `NEEDS_DEPOSIT` | Not enough USDC, or no ETH for gas, on Arbitrum. | Show the address from the message and ask the user to fund it. See [../workflows/deposit.md](../workflows/deposit.md). |
| `POLICY_REJECTED` | The local policy refuses the order, or the guardian refuses an action that is not trading. | Show the reason and `lpa policy show`. Widening the policy is the user's decision, and takes effect at their next `lpa unlock`. |
| `MARKET_HALTED` | The market is not trading right now. | Pick another market, or wait. No order goes out. |
| `BELOW_MIN_ORDER` | Under Hyperliquid's $10 of notional, or under the market's smallest size. | Raise `--size` to what the hint names. |
| `INSUFFICIENT_MARGIN` | The account cannot carry the position. | Show the available margin from the message. Smaller size, or a deposit the user signs. |
| `CONFIRMATION_REQUIRED` | The order or the step needs the user's go, or needs a person at the terminal. | This is the normal path. Show the quote, ask, and run again with `--yes` only if they agree. Never retry with `--yes` on your own. |
| `PAPER_NOT_INITIALIZED` | No paper account yet. | `lpa paper init --budget 1000`. |
| `HYPERLIQUID_ERROR` | Hyperliquid or a library said something we pass on verbatim. | Show it. Retry only if the message says the call is safe to repeat. A mistake of your own (a bad amount, a file of this machine) is never this code: it is `BAD_ARGUMENTS` or `LOCAL_STATE`. |
| `ORDER_REJECTED` | Hyperliquid refused the order itself. | Show the reason. Do not resend the same order. |
| `NETWORK_ERROR` | The call did not reach its host. | `lpa doctor` checks the connection and the clock drift. Then retry. |
| `CANCELLED` | The person cancelled at the terminal, or nothing came back in time. | Stop. Ask the user what they want to do. |
| `HYPERKEEL_NOT_CONNECTED` | A hyperkeel tool that needs the user's account was called without one. | The brief and the leaderboard need no account. For follows and alerts, ask the user to run `lpa hyperkeel login`. |
| `HYPERKEEL_ERROR` | hyperkeel answered an error. | Show it. |
| `SERVICE_ERROR` | The around-the-clock service is not installed, or a system command failed. | `lpa service status`, then `lpa service logs`. |
| `LOCAL_STATE` | A file of the wallet folder is missing, unreadable or not valid JSON. Nothing to do with Hyperliquid. | Show the message, which names the file under `$LPA_HOME`, and run `lpa doctor`. Never retry the call: it will fail the same way. |
| `MANDATE_INVALID` | The mandate on this computer is not one this account signed for this agent: another vault, another agent (after a new `lpa init`), or a changed file; or a live pilot has no mandate in force that allows `pilot`. | Tell the user to run `lpa mandate sign` again; the phone signs it (for the pilot: `--actions trade,pilot`). |
| `NO_MODEL` | The pilot needs a model, and this computer, or the guardian that runs it, reaches none. | Tell the user to choose one with `lpa config` (a key saved there is seen by the guardian). Never arm a pilot yourself: it is the user's act. |
| `PLUGIN_REFUSED` | A plugin was stopped: a capability its command did not declare, a line off its protocol, too many calls, too slow, or its own failure. | Show the reason. Do not retry the same call; `lpa plugins inspect --name <plugin>` shows what it asks for. |
| `QUOTE_STALE` | A quote of an order the pilot proposed was confirmed on the live page more than 120 seconds after it was shown, was already used, or no longer matches the order (paper or real, account, market, side, size, leverage). Nothing was signed. | Only the user confirms on their live page: tell them to look at the quote again there. Never confirm anything yourself. |
| `VERSION_MISMATCH` | The guardian runs another version than the program asking it: `lpa` updated while an old guardian runs, or an MCP server of another version (`npx` at `@latest` starts the newest release while `lpa` stayed on an older one). Nothing was signed. | Tell the user: bring `lpa` to the latest release (run the installer again), then `lpa lock` and `lpa unlock` (the service: `lpa service restart`); or run the server from `~/.lpa/bin/locker-mcp`, always the version of `lpa`. Never retry the same call before that. |
| `VAULT_ANSWER_MISMATCH` | The vault's answer is signed by another account than the one asked: another account chosen on the phone, or a vault of another version. Nothing was sent to Hyperliquid. | Tell the user to check the account the vault shows and that the vault and `lpa` are both up to date, then run the command again. Never retry it alone: the same phone gives the same answer. |

Through MCP, an order tool adds three codes of its own to this list, and answers `QUOTE_STALE` with the new quote when the order changed between the quote and the go. None of them signs anything; each says which half of the go is missing.

| Code | What happened | What you do |
|---|---|---|
| `QUOTE_REQUIRED` | `confirm: true` with no `quote_id`. | Call the tool without `confirm`, show the quote to the user, come back with its `quote_id`. |
| `QUOTE_EXPIRED` | The `quote_id` is unknown, older than ten minutes, or already used. | Quote again and show the new quote. |
| `QUOTE_MISMATCH` | The `quote_id` was issued for other arguments. | Quote these arguments and show that quote. |
| `QUOTE_STALE` | Between the quote and the go, the book (paper or real), the account, the market, the side, the size or the leverage changed; nothing was signed. The answer carries the new quote and its `quote_id`. | Show the user the new quote; once they agree, confirm with its `quote_id`. |

## The refusals that are not errors

Three of these are the design working:

- `CONFIRMATION_REQUIRED` means nothing was signed and the user has the final say.
- `POLICY_REJECTED` means the limits held.
- `LOCKED` means the key is out of reach of every process but the guardian.

Never work around them: do not add `--yes` by yourself, do not widen the policy by yourself, do not look for another way to sign.
