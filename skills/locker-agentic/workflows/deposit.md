# Moving funds: deposit, withdraw, transfer

**You never move funds.** These three commands build a QR code that Locker Vault signs on the user's phone. There is no flag, no environment variable and no tool that signs them here. Hyperliquid itself refuses `withdraw3`, `usdSend`, `spotSend`, `sendAsset` and `usdClassTransfer` to the agent key, measured on mainnet on 2026-09-28.

Your job is to work out the right line, show it, explain it, and hand it over.

## Deposit

```
Usage: lpa perps deposit --amount <usdc> [--yes]
```

USDC travels from Arbitrum One to Hyperliquid. The account needs the USDC there, plus a little ETH for gas.

```sh
lpa wallet balances
lpa perps deposit --amount 100
```

`lpa wallet balances` gives ETH and USDC on Arbitrum and the margin and spot balances on Hyperliquid. If Arbitrum is empty, the answer is `NEEDS_DEPOSIT` and the hint names the account address: show it and ask the user to send USDC there, and around 0.0005 ETH for gas.

When they run `lpa perps deposit --amount 100` themselves, the terminal shows the transfer as a QR code, the phone shows its review card, they sign, and the webcam reads the signature back.

## Withdraw

```
Usage: lpa perps withdraw --amount <usdc> [--destination <0x...>] [--yes]
```

USDC goes back to Arbitrum. Hyperliquid charges 1 USDC. Without `--destination`, it goes to the vault account itself; with it, to the address given, so read that address back to the user before they run the line.

```sh
lpa perps withdraw --amount 50
```

## Transfer between dexes

```
Usage: lpa perps transfer --amount <usdc> --to-dex <name|main> [--from-dex <name|main>] [--yes]
```

Moves margin between the main dex and a HIP-3 dex of the same account. `--from-dex` defaults to the main dex. Source and destination cannot be the same.

```sh
lpa perps balance --all-dexes
lpa perps transfer --amount 25 --to-dex main
```

## What you answer

Through MCP, `perps_deposit`, `perps_withdraw` and `perps_transfer` sign nothing: they answer the exact line for the user to type in their own terminal. Give them that line, say what will appear on the phone, and stop there. Do not call the tool again to "retry": the first answer is the whole answer.

On the command line without a person, the same three answer `CONFIRMATION_REQUIRED` with "This step is signed by Locker Vault, on the phone: the person must be here."

## Before you propose an amount

- Check `lpa wallet balances` and `lpa perps balance` and say the current figures.
- A deposit is not reversible by you: taking it back is a withdrawal with its own 1 USDC fee.
- Recommend a dedicated account holding only what they are ready to risk. That is the real bound on what a compromised machine can lose, and it is what `lpa init` recommends too.
- Never suggest depositing "everything" or "the rest".

## The same rule elsewhere

`lpa init`, `lpa unlock`, `lpa lock`, `lpa agent revoke`, `lpa config`, `lpa console password`, `lpa hyperkeel login`, `lpa reset` and `lpa uninstall` are the person's as well. They need a camera, a phone, a password or a decision. Ask, give the line, and let them run it.
