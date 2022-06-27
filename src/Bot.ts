import 'dotenv/config';
import { Client } from 'discord.js';
import { ready, interactionCreate } from './listeners';

const token = process.env.DISCORD_TOKEN;

console.log('Bot is starting...');

const client = new Client({
  intents: [],
});

const addListeners = (handlers: ((c: Client) => any)[]) => handlers.forEach((h) => h(client));

addListeners([ready, interactionCreate]);

client.login(token);
