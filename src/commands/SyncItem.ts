import { ThreadChannel } from 'discord.js';
import { onlyRunInThread, syncCardData } from './utils';

const SyncItem: Command = {
  name: 'sync',
  description: 'Syncs up & displays the card information between Trello & the discord thread.',
  options: [
    {
      name: 'cardid',
      description: 'The ID of the Trello card that needs to be synced up',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunInThread(async (client, interaction) => {
    await interaction.deferReply();
    const { value: cardId } = <{ value: string }>interaction.options.get('cardid', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    await client.channels.fetch(channel.parentId!);
    await channel.fetchStarterMessage();
    const cardData = await syncCardData(channel, cardId);
    interaction.followUp({
      embeds: [cardData],
    });
  }),
};

export default SyncItem;
