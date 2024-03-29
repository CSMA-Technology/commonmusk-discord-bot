import { ThreadChannel } from 'discord.js';
import {
  onlyRunInThread, linkMessageToTrelloCard, getPrettyCardData, getThreadStarterMessage,
} from './utils';
import { getCard } from '../hooks/trello';

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
    await interaction.deferReply();
    const { value: cardId } = <{ value: string }>interaction.options.get('cardid', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    const starterMessage = await getThreadStarterMessage(client, channel);
    console.log(`starter message: ${starterMessage.content}`);
    await linkMessageToTrelloCard(starterMessage, cardId);
    const cardData = await getCard(cardId);
    interaction.followUp({
      content: 'Linked this message to the card below.',
      embeds: [getPrettyCardData(cardData)],
    });
  }),
};

export default LinkItem;
