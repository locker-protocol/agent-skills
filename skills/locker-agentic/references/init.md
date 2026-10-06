# Setting up: `lpa init`

`lpa init` pairs this computer with Locker Vault and creates the trading agent. **It is typed by the person, not by you.** It opens a local page and a webcam, and the phone signs. An agent has no camera and cannot scan a QR code.

```
Usage: lpa init [--days 180] [--account <index|0x...>]
```

| Flag | What it does |
|---|---|
| `--days` | How long the agent key stays valid. 7 by default, 30 at most. |
| `--account` | Which account of the vault to use: its index in the sync QR, or its address. Asked otherwise. |

## What happens, in order

1. **Accounts.** The page reads the "Sync" QR code of Locker Vault (the vault's only sync screen) and lists the accounts. `lpa` recommends a dedicated account: the most that can be lost is what is deposited on it.
2. **Funding.** Hyperliquid refuses every action from an account that has never been funded. If Arbitrum holds no ETH for gas or less than 5 USDC, `lpa init` shows the address and stops there. See [../workflows/deposit.md](../workflows/deposit.md).
3. **Agent.** `lpa` generates the agent key on this computer, seals it under a password typed in the terminal, and builds the approval for the phone to sign. The agent is named `locker-agent` and expires by itself.
4. **A last signature on the phone** finishes setting up the terminal.

After `lpa init`, the person runs `lpa unlock` to start the guardian, the process that holds the agent key in memory and signs orders. `lpa lock` takes the key out of memory. Neither can be typed by you: `lpa unlock` asks for the password on a terminal, and there is no environment variable for it.

## What you do instead

- Nothing is needed for paper trading: `lpa paper init --budget 1000` works before `lpa init`. See [paper.md](paper.md).
- When a command answers `NOT_INITIALIZED`, tell the user to run `lpa init` themselves, and say what they need: their phone with Locker Vault, a webcam, some USDC and a little ETH on Arbitrum.
- When a command answers `LOCKED`, tell them to run `lpa unlock`.
- To check where things stand without signing anything: `lpa doctor` and `lpa status`.

## Files and settings

Everything lives in one folder, `~/.lpa`, or wherever `LPA_HOME` points: the settings, the sealed agent key, the policy, the paper account and the journal, all `0600`. `lpa reset` wipes that state and keeps the program; `lpa uninstall` removes the program.

`lpa config` opens a local settings page (assistant, limits, paper trading, account). Like `lpa init`, it is for the person.

## Renewing

The agent key expires on its own, six months after `lpa init` by default, the longest Hyperliquid allows, and Hyperliquid stops accepting it. `lpa agent show` and `lpa doctor` say how long is left, and the warnings start thirty days before. Renewing is one QR scan: the person runs `lpa agent renew` (`lpa init` again does the same). `lpa agent revoke` retires the agent immediately and is also signed on the phone.
