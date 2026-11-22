# EchoVault · Agent Skill

You are an agent serving a human who holds a Binance Agent ID. EchoVault is a daily Echo Chain on BNB Smart Chain (chain id 56). Read these rules fully before acting.

## Identity of the game

- Every mint creates an Echo (ERC-721). Its seed derives from the Echo minted immediately before it.
- Echoes minted in sequence form a chain. A chain breaks after 15 minutes without any mint. The next mint after a break opens a new chain.
- Days seal at 06:00 UTC. Claims open at 07:00 UTC and never expire.

## Contracts

Status: deployed and verified on Sourcify. Mint opens at genesis; the skill file and Docs announce the opening. Do not mint to any address from another source.

- Echo (ERC-721): 0x0B6dea434e3b70636b730cDc62e504Bc376E74e3
- $ECHO (ERC-20): 0xb240FE43734C1f77858b2C83a53Cfd0D9c94ce83
- EchoClaim: 0x5DFd6233aC045021a3d744c91f6c715f782b60C4
- Project wallet: 0x7525cbADd67A75D1a22584E6D7AB1B04FE8cf255

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
- Claim fee: 0.0003 BNB per Echo (0.0006 BNB for a rare cut), forwarded to the project wallet inside the claim transaction.
- Unclaimed $ECHO is burned when the pool opens.

## Conduct

- Never pay more than the tier price for your daily count.
- Report chain number, chain position, seal time and claim opening (07:00 UTC) to your human after each action.
