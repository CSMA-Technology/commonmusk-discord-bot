import {
  BaseCommandInteraction, Client, Message, ThreadChannel,
} from 'discord.js';
import { messageMap, writeAppData } from '../appData';
import { getCard, Card } from '../hooks/trello';

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
  messageMap.set(message.id, cardId);
  writeAppData();
  console.log(`Created messageMap entry (${message.id}:${cardId})`);
};

export const getPrettyCardData = (rawCardData: Card): Object => ({
  color: 0x3d8482,
  title: rawCardData.name,
  fields: [{ name: 'description', value: rawCardData.desc }],
  url: rawCardData.shortUrl,
});

export const syncCardData = async (client: Client, channel: ThreadChannel, cardId: string): Promise<Object> => {
  // Get the latest card information
  // TODO: If getting the latest card data fails skip the delete?
  const rawCardData = await getCard(cardId);
  // Delete the previous message from the bot with the card information
  const channelMessages = await channel.messages.fetch();
  const botMessages = channelMessages.filter((m) => m.author.id === client.user?.id);
  const lastBotMessage = botMessages.first();
  if (lastBotMessage) await lastBotMessage.delete();
  return getPrettyCardData(rawCardData);
};
