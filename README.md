# Decentralized Voting Application

This repository contains a decentralized voting application built using Ethereum blockchain and Hedera Hashgraph for secure and transparent voting. Additionally, it includes a Discord bot for interacting with the voting system.

## Installation and Usage

1. **npm install**: 
    ```bash
    npm install
    ```

2. **npm start**: After installing the dependencies, start the voting application by running:

    ```bash
    npm start
    ```

    This command will start the application, allowing users to create elections, register candidates, and vote using Ethereum blockchain.

### Hedera Hashgraph Setup:

- Ensure you have a Hedera Hashgraph account ID and private key.
- Update the `hedera.js` file with your account ID and private key.
- Run the following command to start the Hedera Hashgraph listener:

    ```bash
    node hedera.js
    ```

    This command will set up the Hedera client and allow voting through the Hedera network.

### Discord Bot Integration:

- Ensure you have a Discord bot token.
- Update the `discord-bot.js` file with your bot token.
- Run the following command to start the Discord bot:

    ```bash
    node discord-bot.js
    ```

    This command will start the Discord bot, allowing users to view ongoing elections, register as candidates, and cast votes through Discord commands.

CONTRACT_ADDRESS = '0x0bae40b835bf3fe7f61f69411dd7cd3e7ab27fe6';


