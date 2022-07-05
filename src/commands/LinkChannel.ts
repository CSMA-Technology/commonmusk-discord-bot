import { onlyRunOutsideThread } from './utils';
import { channelMap, writeAppData } from '../appData';

const LinkChannel: Command = {
  name: 'linkchannel',
  description: 'Link the current channel to a board in Trello',
  options: [
    {
      name: 'trellolist',
      description: 'Trello list where new cards from this channel will be created',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunOutsideThread((async (client, interaction) => {
    const { value: trelloListId } = <{ value: string }>interaction.options.get('trellolist', true);
    channelMap.set(interaction.channelId, trelloListId);
    interaction.reply({
      content: `I have mapped this channel (${interaction.channelId}) to the Trello list with ID ${trelloListId}`,
    });
    console.log(`Mapped Discord channel (${interaction.channelId}) to Trello list ${trelloListId}`);
    writeAppData();
  })),
};

export default LinkChannel;
