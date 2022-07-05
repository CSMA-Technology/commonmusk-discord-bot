/// <reference path = "./Types.d.ts" />

import 'dotenv/config';
import { Client } from 'discord.js';
import { ready, interactionCreate } from './listeners';

import { serializeAppData } from './appData';

const token = process.env.DISCORD_TOKEN;

console.log('Bot is starting...');

console.log(`Initial config: ${JSON.stringify(serializeAppData())}`);

const client = new Client({
  intents: [],
});

const addListeners = (handlers: ((c: Client) => any)[]) => handlers.forEach((h) => h(client));

addListeners([ready, interactionCreate]);

client.login(token);
