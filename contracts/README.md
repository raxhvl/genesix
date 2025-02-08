# Genesix contracts

## Getting started

The contract is built using [Foundry](https://book.getfoundry.sh/).

| Command                                                                                               | Description                   |
| ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| `forge build`                                                                                         | Build the contracts           |
| `forge test`                                                                                          | Run the tests                 |
| `forge fmt`                                                                                           | Format the code               |
| `forge snapshot`                                                                                      | Generate gas snapshots        |
| `anvil`                                                                                               | Start the local Ethereum node |
| `forge script script/Deployer.s.sol:Launch --rpc-url <your_rpc_url> --private-key <your_private_key>` | Deploy the contracts          |
| `cast <subcommand>`                                                                                   | Execute a cast subcommand     |
