# Checking the setup: `lpa doctor` and `lpa status`

Both read. Neither signs anything, and neither needs the guardian.

## `lpa doctor`

```sh
lpa doctor
lpa doctor --format json
lpa doctor --egress --format json
```

No flags for the checks. It checks Node, the `lpa` folder and its permissions, the settings, whether `api.hyperliquid.xyz` answers and how far the clock has drifted (nonces are timestamps), the account and how it signs (`signer`: Locker Vault, a browser extension or a mobile wallet, and the state of its link), the agent and its expiry, the mandate, the state of the setup and the funds, then the guardian, the service and its console, the policy, the assistant, hyperkeel, the plugins and the simulation account. Its last line is the step to take.

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
ok  policy       $100 an order, 3x, the main dex, 20 orders a day, no end
-   assistant    off, and optional: lpa config sets one up
-   hyperkeel    not connected, and optional: lpa hyperkeel login
-   paper        no simulation account (lpa paper init --budget 1000)
Everything that is set up works.
Next: 'lpa setup' walks the whole way, with your phone: about five minutes. 'lpa setup --paper' opens a simulation account instead, with no phone and no money.
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
  "next": "'lpa setup' walks the whole way, with your phone: about five minutes. 'lpa setup --paper' opens a simulation account instead, with no phone and no money."
}
```

`ok` is `true` when the check passed, `false` when it failed, and `null` when there is nothing to check yet (nothing set up). The top-level `ok` is false only when a check failed. A `null` check is not a problem: trading in simulation works with every check null but `node`, `home` and `hyperliquid`.

Each `detail` names what to do. Read it and pass it on rather than guessing.

It says the profile it read (`profile`); on the principal profile it adds a line for each other profile of the computer (`profiles`: its service, its key, its next day). With several profiles, `lpa doctor --profile <name>` checks that one.

`lpa doctor --egress` reads the register of the calls that left this computer in the last thirty days, kept on the computer and sent nowhere: each host with its calls (`hosts`), and the last calls (`last`, `--limit`, 100 by default), each its host, method, path without its query, moment, bytes sent, status and time; never a body, a header or a query. It is the user's to read; it is read only, like the checks.

`lpa doctor --files` measures the `lpa` folder: the space left on its disk and every path kept there, with its mode as measured, the one it should have and its size. It is read only. `lpa doctor --fix-modes` puts each file back to 600 and each folder to 700, a link left as it is, and says what it changed: it writes, so offer it and let the user run it.

## `lpa status`

The same picture in eleven lines, without the network, ending on the same step:

```
account    none
agent      none
key        locked: nothing can be signed
policy     $100 an order, 3x, the main dex, 20 orders a day, no end
mandate    no mandate: no account is set up on this computer yet, so there is nothing to bound
copies     none
service    not running here
assistant  off (lpa config sets it up)
today      0 of 20 orders, $0.00 opened
mode       real
next       'lpa setup' walks the whole way, with your phone: about five minutes. 'lpa setup --paper' opens a simulation account instead, with no phone and no money.
```

With `--format json`, the fields to read first are `journey` (where the person stands: `fresh`, `practice`, `account`, `pending`, `expired`, `expiring`, `locked`, `mandate`, `paper`, `ready`) and `next` (the sentence above). Then `guardian.unlocked` false means nothing can be signed: the person runs `lpa unlock`; `paperMode` true means every perps command goes to the simulation account; `today` counts the opening orders of the UTC day against the policy's cap (no loss of the day is counted: none stops anything since 2.4.0). `profile` names the profile read.

Three fields appear only when they apply:

- `keyEnding` (`validUntil`, `hoursLeft`): the agent key ends within 24 hours. Nothing new opens on the real account meanwhile; closing stays allowed. Tell the user to run `lpa agent renew`.
- `modelOutage`: the last day of the daily pilot that ended `model-down`, every call to the model having failed; nothing new was opened that day. See [pilot.md](pilot.md).
- `noticesOn` (`onAt`): the notices are on (below).

## The notices: `lpa notices`

```sh
lpa notices
lpa notices on
lpa notices off
lpa notices test
```

What keeps the service or the pilot from its work (the key locked, the agent's end near, a copy paused, a day of the model down) is said in the console and the record. It reaches the user's phone, through their hyperkeel account, only once they run `lpa notices on`: off by default. Only the kind of a notice and at most one whole number leave, never an address, an amount, the key or its password; each post is in `lpa doctor --egress`. `lpa notices` alone reads the switch, and `lpa notices test` sends one test notice and says whether it left (`sent`, `how`). Turning them on or off is the user's choice: propose the line, do not run it on your own.

## When to run them

- Once at the start of a session, before the first operation. The plugin's session-start hook already does this and puts the summary in your context.
- Again whenever a command answers `NOT_INITIALIZED`, `LOCKED`, `AGENT_EXPIRED`, `AGENT_NOT_APPROVED` or `NETWORK_ERROR`.

See [../workflows/troubleshooting.md](../workflows/troubleshooting.md) for what each answer means.
