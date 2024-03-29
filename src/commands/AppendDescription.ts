import { ThreadChannel } from 'discord.js';
import { getCard, updateCard } from '../hooks/trello';
import { messageMap } from '../appData';
import { getThreadStarterMessage, onlyRunInThread, syncCardData } from './utils';

const AppendDescription: Command = {
  name: 'appenddescription',
  description: 'Appends to the description of the card linked in this thread',
  options: [
    {
      name: 'addendum',
      description: 'Something to append to the end of the Trello card description',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunInThread(async (client, interaction) => {
    const { value: addendum } = <{ value: string }>interaction.options.get('addendum', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    const message = await getThreadStarterMessage(client, channel);
    if (!messageMap.has(message.id)) {
      const content = `Error: No Trello card is mapped to message with ID ${message.id}`;
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }
    await interaction.deferReply();
    const cardId = messageMap.get(message.id)!;
    const card = await getCard(cardId);
    const newDescription = `${card.desc}\n\n${addendum}`;
    await updateCard(cardId, undefined, newDescription);
    console.log(`Added the following to the description of card ID ${cardId}:\n${addendum}`);
    const updatedCardData = await syncCardData(channel, cardId);
    return interaction.followUp({
      content: 'This card has been updated!',
      embeds: [updatedCardData],
    });
  }),
};

export default AppendDescription;
