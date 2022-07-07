import { ThreadChannel } from 'discord.js';
import { createCard } from '../hooks/trello';
import { linkMessageToTrelloCard, onlyRunInThread, getPrettyCardData } from './utils';
import { channelMap } from '../appData';

const CreateItem: Command = {
  name: 'createitem',
  description: 'Create a card in Trello that tracks this idea',
  options: [
    {
      name: 'name',
      description: 'Name for the Trello card',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunInThread(async (client, interaction) => {
    const { value: trelloCardName } = <{ value: string }>interaction.options.get('name', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    if (!channel.parentId || !channelMap.has(channel.parentId)) {
      const message = `Error: No trello list is mapped for the parent channel: ${channel.parentId}`;
      console.error(message);
      return interaction.reply({
        ephemeral: true,
        content: message,
      });
    }
    await client.channels.fetch(channel.parentId);
    const trelloListId = channelMap.get(channel.parentId)!;
    const starterMessage = await channel.fetchStarterMessage();
    const card = await createCard(trelloCardName, starterMessage.content, trelloListId);
    linkMessageToTrelloCard(starterMessage, card.id);
    return interaction.reply({
      content: 'Created a card in Trello to track this idea. Link details should be below.',
      embeds: [getPrettyCardData(card)],
    });
  }),
};

export default CreateItem;
