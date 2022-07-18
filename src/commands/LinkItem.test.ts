import { Client, CommandInteraction, Guild } from 'discord.js';
import LinkItem from './LinkItem';
import MockDiscord from '../testUtils/mockDiscord';
import { convertToMock, runInThread, runOutsideOfThread } from '../testUtils/helpers';
import { getPrettyCardData, getThreadStarterMessage } from './utils';
import { messageMap, writeAppData } from '../appData';
import { getCard } from '../hooks/trello';

jest.mock('./utils');
jest.mock('../appData');
jest.mock('../hooks/trello');

const [mockGetThreadStarterMessage, mockWriteAppData, mockGetCard] = convertToMock(
  [getThreadStarterMessage, writeAppData, getCard],
);
mockGetThreadStarterMessage.mockImplementation(() => ({ id: 'Message1', content: 'some content' }));

const cardId = 'Card1';
const mockCard = {
  id: cardId,
  name: 'Some Card',
  desc: 'Some description',
  idList: 'List1',
  shortUrl: 'test.com/card1',
};
mockGetCard.mockImplementation(() => mockCard);

describe('LinkItem', () => {
  it('should have the correct name property', () => {
    expect(LinkItem.name).toEqual('linkitem');
  });

  describe('run function', () => {
    const { run } = LinkItem;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;
    let mockDefer: jest.Mock;
    let mockFollowUp: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      messageMap.clear();
      mockDiscord = new MockDiscord({
        command: {
          id: 'linkchannel',
          name: 'linkchannel',
          type: 1,
          options: [
            {
              type: 3,
              name: 'cardid',
              value: 'Card1',
            },
          ],
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
      mockDefer = interaction.deferReply as jest.Mock;
      mockFollowUp = interaction.followUp as jest.Mock;
    });

    it('should error when run outside of a thread', async () => {
      await runOutsideOfThread(client, guild, interaction, run);
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in a thread.',
      });
    });

    it('should link a message to a card', async () => {
      await runInThread(client, guild, interaction, run);

      expect(mockDefer).toHaveBeenCalledTimes(1);
      expect(mockDefer).toHaveBeenCalledWith();

      expect(messageMap.size).toEqual(1);
      expect(messageMap.get('Message1')).toEqual('Card1');

      expect(mockWriteAppData).toHaveBeenCalledTimes(1);

      expect(mockFollowUp).toBeCalledTimes(1);
      expect(mockFollowUp).toBeCalledWith({
        content: 'Linked this message to the card below.',
        embeds: [getPrettyCardData(mockCard)],
      });
    });
  });
});
