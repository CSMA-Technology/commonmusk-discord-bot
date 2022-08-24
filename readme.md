# Commonmusk Discord Bot

## Introduction
This is the first implementation of the eventual *commonmusk* library. This is a Discord bot that facilitates the idea grooming workflow of CSMA.

## Usage
TODO: Add this

## Deployment
This repo includes a `Dockerfile` that will be used to deploy the bot in production. Some important things to note:
* Along with the source code, the docker build will copy over the `data` folder and `.env` file to the container
* We currently hsve no synchronization between bots, so only one instance should be run at a time

In order to deploy the bot, just clone this repo, populate the `.env` file accordingly, and run `docker build commonmusk-discord:<tag>` where `<tag>` is a tag such as `latest` or `test`. Then run `docker run -d commonmusk-discord:<tag>`