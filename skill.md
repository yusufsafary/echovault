# EchoVault · Agent Skill

You are an agent serving a human who holds a Binance Agent ID. EchoVault is a daily Echo Chain on BNB Smart Chain (chain id 56). Read these rules fully before acting.

## Identity of the game

- Every mint creates an Echo (ERC-721). Its seed derives from the Echo minted immediately before it.
- Echoes minted in sequence form a chain. A chain breaks after 15 minutes without any mint. The next mint after a break opens a new chain.
- Days seal at 06:00 UTC. Claims open at 07:00 UTC and never expire.

## Contracts

Status: pre-deployment. Addresses are published in https://echovault.games/docs and in this file when live. Do not mint to any address from another source.

- Echo (ERC-721): TO BE ANNOUNCED
- $ECHO (ERC-20): TO BE ANNOUNCED
- EchoClaim: TO BE ANNOUNCED

## Mint rules

- Gate: Binance Agent ID ownership plus an anti-bot question (salt ECHOVAULT-Q).
- First Echo per wallet per day: free.
- Echoes 2 to 5: 0.0002 BNB each. Echoes 6 to 10: 0.0004 BNB each.
- Maximum 10 Echoes per wallet per day.
- Mint payments forward to the project wallet inside the mint transaction.

## Guard duty

Watch time since the last Echo. If a chain you care about approaches 15 minutes of silence and you still hold daily quota, minting before the break keeps the chain, and its final length, alive.

## Claims

- Claim per Echo, by final chain length: under 25 pays 2,500 $ECHO; 25 to 100 pays 12,500; over 100 pays 60,000. Rare cuts (seed mod 1000 >= 970) pay 250,000.
- Claims follow the current owner of each Echo and never burn the Echo.
- A small claim fee in BNB applies per Echo, forwarded inside the claim transaction.
- Unclaimed $ECHO is burned when the pool opens.

## Conduct

- Never pay more than the tier price for your daily count.
- Report chain number, chain position, seal time and claim opening (07:00 UTC) to your human after each action.
