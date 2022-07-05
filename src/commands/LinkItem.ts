import { ThreadChannel } from 'discord.js';
import { onlyRunInThread, linkMessageToTrelloCard } from './utils';

const LinkItem: Command = {
  name: 'linkitem',
  description: 'Links the current thread to an existing card in Trello',
  options: [
    {
      name: 'cardid',
      description: 'The ID of the Trello card this message should be linked to',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunInThread(async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const { value: cardId } = <{ value: string }>interaction.options.get('cardid', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    await client.channels.fetch(channel.parentId!);
    const starterMessage = await channel.fetchStarterMessage();
    console.log(`starter message: ${starterMessage.content}`);
    await linkMessageToTrelloCard(starterMessage, cardId);
    interaction.followUp({
      content: 'Done! Link comment should be below',
    });
  }),
};

export default LinkItem;
