import {
  BaseCommandInteraction, Client, Message, ThreadChannel,
} from 'discord.js';
import { messageMap, writeAppData } from '../appData';

const isInteractionInThread = async (client: Client, interaction: BaseCommandInteraction): Promise<boolean> => {
  const channel = await client.channels.fetch(interaction.channelId);
  return channel instanceof ThreadChannel;
};

export const onlyRunInThread = (runFunc: (client: Client, interaction: BaseCommandInteraction) => void) => (
  async (client: Client, interaction: BaseCommandInteraction) => {
    if (await isInteractionInThread(client, interaction)) {
      return runFunc(client, interaction);
    }
    return interaction.reply({
      ephemeral: true,
      content: 'This command can only be used in a thread.',
    });
  }
);

export const onlyRunOutsideThread = (runFunc: (client: Client, interaction: BaseCommandInteraction) => void) => (
  async (client: Client, interaction: BaseCommandInteraction) => {
    if (!(await isInteractionInThread(client, interaction))) {
      return runFunc(client, interaction);
    }
    return interaction.reply({
      ephemeral: true,
      content: 'This command can only be used in the top level of a channel',
    });
  }
);

export const linkMessageToTrelloCard = async (message: Message, cardId: string) => {
  console.log(`Linking discord message:trello card id: ${message.id}:${cardId}`);
  let { thread } = message;
  if (!thread) {
    console.log('Message has no thread, creating one');
    thread = await message.startThread({ name: message.content });
  }
  // TODO: generate a link to the card here
  await thread.send(`Linked to Trello Card: ${cardId}`);
  messageMap.set(message.id, cardId);
  writeAppData();
  console.log(`Created messageMap entry (${message.id}:${cardId})`);
};
