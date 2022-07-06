import { ThreadChannel } from 'discord.js';
import { onlyRunInThread, linkMessageToTrelloCard, getPrettyCardData } from './utils';
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
    await interaction.deferReply({
      ephemeral: true,
    });
    const { value: cardId } = <{ value: string }>interaction.options.get('cardid', true);
    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    await client.channels.fetch(channel.parentId!);
    const starterMessage = await channel.fetchStarterMessage();
    console.log(`starter message: ${starterMessage.content}`);
    await linkMessageToTrelloCard(starterMessage, cardId);
    const cardData = await getCard(cardId); // TODO: is it annoying that this links the message and then also calls the api again should we call this somewhere else
    interaction.followUp({
      content: 'Done! Link comment should be below',
      embeds: [getPrettyCardData(cardData)]
    });
  }),
};

export default LinkItem;
