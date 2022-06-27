import 'dotenv/config';
// import { Client } from 'discord.js';
// import { ready, interactionCreate } from './listeners';
import {
  createCard, getCard, moveCard, updateCard,
} from './hooks/trello/TrelloCards';

// const token = process.env.DISCORD_TOKEN;

console.log('Bot is starting...');

// const client = new Client({
//   intents: [],
// });

// const addListeners = (handlers: ((c: Client) => any)[]) => handlers.forEach((h) => h(client));

// addListeners([ready, interactionCreate]);

// client.login(token);

let id = '';
createCard('hi there', 'fuck you', '62b35a64c1fe3e31e948f658')
  .then((result) => {
    id = result;
    console.log(`new card id: ${result}`);
  }, (error) => {
    console.log(error);
  })
  .then(() => {
    getCard(id).then((result) => {
      console.log(result);
    }, (error) => {
      console.log(error);
    });
  }, (error) => {
    console.log(error);
  })
  .then(() => {
    moveCard(id, '62b35a64c1fe3e31e948f658', '62b35a674e7d47469ae9ed0f');
  })
  .then(() => {
    updateCard({ id, idList: '62b35a674e7d47469ae9ed0f', name: 'new nameafadf' });
  });
