# Commonmusk Discord Bot

## About the Project

### Overview
This is the first implementation of the eventual *commonmusk* library. This is a Discord bot that facilitates the idea grooming and task creation workflow of CSMA in Trello.

The eventual vision for this platform is to create a centralized bot orchestrator that allows many different productivity platforms to connect with each other and automates workflows for users. 

### Built With
* This bot is written in [Typescript](https://www.typescriptlang.org/).
* It uses the [Discord.js](https://discord.js.org/#/) Node module for all Discord functionality.
* It is integrated with the [Trello API](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/) for all Trello functionality.

## Usage
**How to use the Commonmusk Discord Bot**

`/linkchannel`: Links a discord channel to a trello list,
which will allow me to convert messages from that channel into cards in that list, and keep them synced up.

`/createitem`: Hit me with this when you have discussed an idea and want to make it into a Trello card
in the replies of that idea, I'll do the rest.

`/linkitem`: If a card already exists that you want to link a message to, use this in the replies with the card ID.

`/setdescription`: Updates the description of the card in Trello (overwriting what's already there).

`/appenddescription`: Adds to the bottom of the card's description in Trello.

`/createmetric`: Creates a custom metric to be tracked in Trello for your cards.

`/deletemetric`: Deletes a custom metric.

`/setmetrics`: Allows you to set values for your custom metrics on a card (values must be integers).

`/synccard`: Manually syncs a card with your Trello board to get the most updated information.

## Getting Started
### Prerequisites
- Download the latest version of [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Download [VSCode](https://code.visualstudio.com/)
  - If you are using Windows, you may want to look into using [WSL](https://code.visualstudio.com/blogs/2020/07/01/containers-wsl) to set up your dev containers.

### Installation
1. Clone the repo `git clone git@github.com:CSMA-Technology/commonmusk-discord-bot.git`.

2. Open the folder in VSCode. The easiest way is by using the [CLI command for VSCode](https://code.visualstudio.com/docs/editor/command-line).
```
cd <Path to your clone>/commonmusk-discord-bot
code . 
```
3. VSCode should then prompt you to reopen the project in the dev container. Otherwise, you can do so from the command palette by hitting `Ctrl/CMD + Shift + P > Reopen in Container`

4. Run `npm install` to install all the necessary packages in your container.

5. Create a `.env` file at the top level of the file structure. It should have the following structure (replace the placeholders here with your own tokens).
```
DISCORD_TOKEN=your_discord_token
TRELLO_TOKEN=your_trello_token
TRELLO_KEY=your_trello_key
```

6. Run `npm start` to start the bot, and use the commands above!

## Deployment
This repo includes a `Dockerfile` that will be used to deploy the bot in production. Some important things to note:
* Along with the source code, the docker build will copy over the `data` folder and `.env` file to the container
* We currently hsve no synchronization between bots, so only one instance should be run at a time

In order to deploy the bot, just clone this repo, populate the `.env` file accordingly, and run `docker build -t commonmusk-discord:<tag> .` where `<tag>` is a tag such as `latest` or `test`. Then run `docker run -d commonmusk-discord:<tag>`

## Contributing
If you would like to work with us on this project, or have suggestions on how to make any part of the game better, please fork our repo and create a pull request, and please reach out to us using the contact info below. Thank you!!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/super-cool-feature`)
3. Commit your Changes (`git commit -m 'Added something super cool'`)
4. Push to the Branch (`git push origin feat/super-cool-feature`)
5. Open a Pull Request

## Contact Us
This project is part of CSMA Technology. To reach out to us, feel free to use the contact form on our website here: https://csma.technology/contact

### Our Team
* [Stephanie Cruz](https://github.com/exscruzme) - stephanie@csma.technology
* [Adrian Moya](https://github.com/admoya) - adrian@csma.technology