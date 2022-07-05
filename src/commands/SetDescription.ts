import { ThreadChannel } from 'discord.js';
import { updateCard } from '../hooks/trello';
import { messageMap } from '../appData';
import { onlyRunInThread } from './utils';

const SetDescription: Command = {
  name: 'setdescription',
  description: 'Sets the description of a card',
  options: [
    {
      name: 'description',
      description: 'The new description for this card',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunInThread(async (client, interaction) => {
    const { value: description } = <{ value: string }>interaction.options.get('description', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    await client.channels.fetch(channel.parentId!);
    const message = await channel.fetchStarterMessage();
    if (!messageMap.has(message.id)) {
      const content = `Error: No Trello card is mapped to message with ID ${message.id}`;
      console.error(message);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }
    const cardId = messageMap.get(message.id)!;
    await updateCard(cardId, undefined, description);
    const content = `Trello card description for ${cardId} updated to:
${description}`;
    console.log(content);
    return interaction.reply({
      content,
    });
  }),
};

export default SetDescription;
