# Checking the setup: `lpa doctor` and `lpa status`

Both read. Neither signs anything, and neither needs the guardian.

## `lpa doctor`

```sh
lpa doctor
lpa doctor --format json
```

No flags of its own. It checks Node, the `lpa` folder and its permissions, the settings, whether `api.hyperliquid.xyz` answers and how far the clock has drifted (nonces are timestamps), the vault account, the agent and its expiry, the mandate, the state of the setup and the funds, then the guardian, the service and its console, the policy, the assistant, hyperkeel, the plugins and the practice account. Its last line is the step to take.

Human output, one line per check:

```
ok  node         Node 24.21.0
ok  home         /Users/you/.lpa mode 700
-   config       no config.json yet
ok  hyperliquid  api.hyperliquid.xyz answers in 264 ms; clock drift 444 ms
-   account      no vault account yet: run lpa init
-   guardian     not running: nothing is signed until lpa unlock
-   service      not installed: nothing runs once this terminal closes (lpa service install)
-   console      no password yet: lpa service install asks for one (lpa console password)
ok  policy       $100 an order, 3x, the main dex, 20 orders a day, 10% day loss, no end
-   assistant    off, and optional: lpa config sets one up
-   hyperkeel    not connected, and optional: lpa hyperkeel login
-   paper        no practice account (lpa paper init --budget 1000)
Everything that is set up works.
Next: 'lpa setup' walks the whole way, with your phone: about ten minutes. 'lpa setup --paper' opens a practice account instead, with no phone and no money.
```

JSON output:

```json
{
  "ok": true,
  "checks": [
    { "name": "node", "ok": true, "detail": "Node 24.21.0" },
    { "name": "home", "ok": true, "detail": "/Users/you/.lpa mode 700" },
    { "name": "config", "ok": null, "detail": "no config.json yet" },
    { "name": "hyperliquid", "ok": true, "detail": "api.hyperliquid.xyz answers in 311 ms; clock drift 587 ms" },
    { "name": "account", "ok": null, "detail": "no vault account yet: run lpa init" },
    { "name": "guardian", "ok": null, "detail": "not running: nothing is signed until lpa unlock" }
  ],
  "next": "'lpa setup' walks the whole way, with your phone: about ten minutes. 'lpa setup --paper' opens a practice account instead, with no phone and no money."
}
```

`ok` is `true` when the check passed, `false` when it failed, and `null` when there is nothing to check yet (nothing set up). The top-level `ok` is false only when a check failed. A `null` check is not a problem: paper trading works with every check null but `node`, `home` and `hyperliquid`.

Each `detail` names what to do. Read it and pass it on rather than guessing.

## `lpa status`

The same picture in eleven lines, without the network, ending on the same step:

```
account    none
agent      none
key        locked: nothing can be signed
policy     $100 an order, 3x, the main dex, 20 orders a day, 10% day loss, no end
mandate    no mandate: no account is set up on this computer yet, so there is nothing to bound
copies     none
service    not running here
assistant  off (lpa config sets it up)
today      0 of 20 orders, $0.00 opened
mode       real
next       'lpa setup' walks the whole way, with your phone: about ten minutes. 'lpa setup --paper' opens a practice account instead, with no phone and no money.
```

With `--format json`, the fields to read first are `journey` (where the person stands: `fresh`, `practice`, `account`, `pending`, `expired`, `expiring`, `locked`, `mandate`, `paper`, `ready`) and `next` (the sentence above). Then `guardian.unlocked` false means nothing can be signed: the person runs `lpa unlock`; `paperMode` true means every perps command goes to the paper account; `today` counts the opening orders of the UTC day against the policy's cap.

## When to run them

- Once at the start of a session, before the first operation. The plugin's session-start hook already does this and puts the summary in your context.
- Again whenever a command answers `NOT_INITIALIZED`, `LOCKED`, `AGENT_EXPIRED`, `AGENT_NOT_APPROVED` or `NETWORK_ERROR`.

See [../workflows/troubleshooting.md](../workflows/troubleshooting.md) for what each answer means.
