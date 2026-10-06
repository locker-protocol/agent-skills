# Onboarding a new user

The order matters: paper first, because it needs nothing, and the real account only when the user asks for it.

## 1. See where they stand

```sh
lpa doctor --format json
lpa status --format json
```

If `lpa` is not on the PATH, say so and give the install line; never install it yourself:

```sh
curl -fsSL https://hyperagentictrader.com/agent-wallet-install.sh | sh
```

Read `status.next` first: it is the step to take, one sentence, the same one `lpa doctor` ends with and the session's banner shows. `status.journey` names where they stand (`fresh`, `practice`, `account`, `pending`, `expired`, `expiring`, `locked`, `mandate`, `paper`, `ready`). Then the details: `account` null means no vault account yet, `guardian.unlocked` false means nothing can be signed, `paperMode` says which book their orders would reach.

A group word alone lists its commands, with two sentences on what the group is for: `lpa mandate`, `lpa perps`, `lpa service`, `lpa copy`. `lpa help` is the whole list.

## 2. Offer paper trading

This is the first thing to propose, and it works with no key, no vault and no setup.

```sh
lpa paper init --budget 1000
```

Then a first trade, quote first:

```sh
lpa perps quote --symbol BTC --side long --size 0.001 --leverage 2
```

Show the quote. Entry and worst accepted price, notional and margin, the fees as one total, the liquidation estimate. Ask. Only if they agree:

```sh
lpa perps open --symbol BTC --side long --size 0.001 --leverage 2 --paper --yes
lpa paper status
```

`lpa paper on` sends every later perps command to the paper account until `lpa paper off`.

## 3. Explain the real setup before they run it

Say plainly what it involves, then let them do it:

- Locker Vault installed on a phone or tablet, offline. The account's private key stays there and never reaches this computer.
- A webcam on this computer. `lpa init` opens a local page that shows QR codes and reads the phone's answers.
- A dedicated account with only what they are ready to risk, which is what `lpa init` recommends.
- Some USDC and a little ETH for gas on Arbitrum One.
- A password they type at the terminal, which seals the agent key on this computer.

Then:

```sh
lpa setup
```

They run it. You cannot: it needs a camera, a phone and passwords. It walks the whole way in nine steps (this computer, the AI model the pilot thinks with, the vault account, some funds, the password and the trading key, the limits, the limits signed on the phone, the service, the daily pilot scheduled on paper), skips what is done, and is taken up where it stopped when run again. It never offers a deposit below 5 USDC, which the bridge loses. `lpa setup --paper` opens a practice account instead, with no phone and no money. Each step is also a command of its own (`lpa init` for the account and the key: [../references/init.md](../references/init.md)).

## 4. After the setup

```sh
lpa unlock
```

Typed by them too: it asks for the password and starts the guardian, the process that holds the agent key in memory and signs orders. There is no environment variable for the password, on purpose.

Then check what the limits are, and say them out loud:

```sh
lpa policy show
```

The shipped defaults are $100 per order, leverage 3, the main dex, 20 orders a day, and a daily loss of 10 % of the equity at the day's first opening. Closing and cancelling are always allowed. See [../references/policy.md](../references/policy.md).

Once the limits are the ones they want, they can sign them on the phone, so that nothing on this computer can widen them:

```sh
lpa mandate sign
```

Typed by them: the phone signs it. The guardian then applies the narrower of the mandate and the local policy before every opening. It is optional for trading by hand, and required for live copies. The policy comes first: a mandate is signed from it. See [../references/mandate.md](../references/mandate.md).

## 5. What to tell them about safety

- The recovery phrase is on the phone, in Locker Vault, and nothing on this computer can read it.
- The agent key here can trade. Hyperliquid refuses it every withdrawal, send and agent approval, measured on mainnet on 2026-09-28; the one movement of funds it accepts from that key is a deposit into a Hyperliquid vault, which lpa never signs.
- A stolen agent key still cannot withdraw or send, but it can lose money: by trading, and by paying the account into a Hyperliquid vault run by the thief, which Hyperliquid accepts from an agent key and only lpa's guardian refuses. The real bound is the dedicated account.
- The agent key expires by itself, six months after `lpa init` by default; `lpa agent renew` approves the next one in one scan.
- Deposits, withdrawals and transfers are QR codes only a person can sign.

Do not promise more than that.
