# Setting up: `lpa init`

`lpa init` pairs this computer with the user's wallet and creates the trading agent. **It is typed by the person, not by you.** It opens a local page, and the user's wallet signs. An agent has no camera, no phone and no extension.

```
Usage: lpa init [--days 180] [--account <index|0x...>] [--with vault|mobile|browser] [--from-sync]
```

| Flag | What it does |
|---|---|
| `--with` | How the account signs. `vault`, the default: Locker Vault, the safest, by QR codes and a webcam. `browser`: the user's browser extension (MetaMask, Rabby), on a page of this computer. `mobile`: the user's mobile wallet, over a WalletConnect QR scanned once. |
| `--days` | How long the agent key stays valid: 180 days by default, from 1 to 180. |
| `--account` | Which account: its index in the vault's sync QR, or its address. With `browser` or `mobile`, the only address the wallet may link. |
| `--from-sync` | With Locker Vault, takes the account from the vault's sync this computer read last, without a new scan. |

## Three ways to sign

1. **Locker Vault** is recommended and comes first: the account's key stays on a phone or tablet kept offline, requests and answers travel as QR codes, and the phone shows each request in words before it signs.
2. **A browser extension** signs on a local page of this computer.
3. **A mobile wallet** signs over WalletConnect: the requests travel encrypted through WalletConnect's relay, which sees this computer's IP address and the time, not the content.

With an extension or a mobile wallet, the account is proven first, before any money, by one signature that moves nothing, checked on this computer and sent nowhere; an address that is a contract (a smart wallet) is refused. These wallets show a typed signature as raw fields: the local page explains each field so the user can compare. `lpa setup` asks the same question at its account step, Locker Vault first.

```sh
lpa signer show
lpa signer use vault
lpa signer forget
```

`lpa signer show` says how the account signs and, for a mobile wallet, the state of its link. `lpa signer use vault` (or `lpa signer use browser`, `lpa signer use mobile`) changes the way for the same address only, after the new wallet proves it signs for it; the agent key and the mandate stay. `lpa signer forget` closes the link with a mobile wallet. All three are the user's to run; `show` is a read you may run.

## What happens, in order

1. **Account.** With Locker Vault, the page reads the vault's "Sync" QR code and lists the accounts. With an extension or a mobile wallet, the wallet links one address and proves it. `lpa` recommends a dedicated account: the most that can be lost is what is deposited on it.
2. **Funding.** Hyperliquid refuses every action from an account that has never been funded. If the account has nothing on Hyperliquid, `lpa init` shows the address and stops there. See [../workflows/deposit.md](../workflows/deposit.md).
3. **Agent.** `lpa` generates the agent key on this computer, seals it under a password typed in the terminal (14 characters or more), and builds the approval for the wallet to sign. The agent is named `locker-agent` and expires by itself.
4. **The service fee.** "Authorize the Locker service fee", signed or refused by the user; refused, orders simply go out without it.

After `lpa init`, the person runs `lpa unlock` to start the guardian, the process that holds the agent key in memory and signs orders. `lpa lock` takes the key out of memory. Neither can be typed by you: `lpa unlock` asks for the password on a terminal, and there is no environment variable for it.

## What you do instead

- Nothing is needed for trading in simulation: `lpa paper init --budget 1000` works before `lpa init`. See [paper.md](paper.md).
- When a command answers `NOT_INITIALIZED`, tell the user to run `lpa setup` (or `lpa init`) themselves, and say what they need: Locker Vault on a phone and a webcam (or their extension, or their mobile wallet), some USDC and a little ETH on Arbitrum.
- When a command answers `LOCKED`, tell them to run `lpa unlock`.
- To check where things stand without signing anything: `lpa doctor`, `lpa status` and `lpa signer show`.

## Several accounts: profiles

One account is one profile, a whole `lpa` folder of its own: its key, its mandate, its limits, its pilot, its simulation account, its journal and its service. `~/.lpa` is the first profile, `principal`; the others live under `~/.lpa/profiles/<name>/`, ten at most.

```sh
lpa profile list
lpa profile add --name account-2
lpa setup --profile account-2
lpa status --profile account-2
lpa profile use --name account-2
```

`--profile <name>` works on any command, and so does `LPA_PROFILE`; `LPA_HOME`, when set, is read first. Without either, the current profile (`lpa profile use`) is used. `lpa status` and `lpa doctor` say the profile they read. Always say which profile a command ran for when there is more than one. `lpa profile add` copies the model's settings and the hyperkeel connection, nothing of the account; `lpa setup --profile <name>` does the rest, and is the user's. An account another profile holds is refused. `lpa profile remove --name <name>` is refused while anything is open there, and is the user's decision. The MCP server serves one profile: `locker-mcp --profile <name>`.

## Files and settings

Everything of a profile lives in its folder, `~/.lpa` for the first one, or wherever `LPA_HOME` points: the settings, the sealed agent key, the policy, the simulation account and the journal, all `0600`. `lpa reset` wipes that state and keeps the program; `lpa uninstall` removes the program.

`lpa config` opens a local settings page (assistant, limits, simulation, account). Like `lpa init`, it is for the person.

## Renewing

The agent key expires on its own, six months after `lpa init` by default, the longest Hyperliquid allows, and Hyperliquid stops accepting it. `lpa agent show` and `lpa doctor` say how long is left, and the warnings start thirty days before. In its last 24 hours nothing new is opened on the real account (the pilot's days end `key-ending`, its openings are refused by `AGENT_EXPIRED`); closing stays allowed. Renewing is one signature: the person runs `lpa agent renew` (`lpa init` again does the same). `lpa agent revoke` retires the agent immediately and is also signed by the user's wallet.
