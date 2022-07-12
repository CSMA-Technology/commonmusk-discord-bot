import {
  Client, CommandInteraction, Guild, ThreadChannel,
} from 'discord.js';
import SetDescription from './SetDescription';
import MockDiscord from '../testUtils/mockDiscord';
import { runInThread, runOutsideOfThread } from '../testUtils/helpers';
import { messageMap } from '../appData';
import { updateCard } from '../hooks/trello';
import { getThreadStarterMessage, syncCardData } from './utils';

// Setting the types for the mocks
const mockGetThreadStarterMessage = <jest.Mock>getThreadStarterMessage;
const mockUpdateCard = <jest.Mock>updateCard;
const mockSyncCardData = <jest.Mock>syncCardData;

jest.mock('../appData', () => ({
  messageMap: new Map<string, string>(),
}));

jest.mock('./utils', () => {
  const original = jest.requireActual('./utils');
  return {
    __esModule: true,
    ...original,
    getThreadStarterMessage: jest.fn(),
    syncCardData: jest.fn(),
  };
});

jest.mock('../hooks/trello', () => ({
  esModule: true,
  updateCard: jest.fn(),
}));

describe('SetDescription', () => {
  it('should have the correct name property', () => {
    expect(SetDescription.name).toEqual('setdescription');
  });
  describe('run function', () => {
    const { run } = SetDescription;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockDiscord = new MockDiscord({
        command: {
          id: 'setdescription',
          name: 'setdescription',
          type: 1,
          options: [
            {
              type: 3,
              name: 'description',
              value: 'New test description',
            },
          ],
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
    });

    it('should error when called outside of a thread', async () => {
      await runOutsideOfThread(client, guild, interaction, run);
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in a thread.',
      });
    });

    it('should error if the thread is not in the message map', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      mockGetThreadStarterMessage.mockImplementationOnce(() => ({ id: '234' }));

      await runInThread(client, guild, interaction, run);

      const content = 'Error: No Trello card is mapped to message with ID 234';
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content,
      });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(content);
    });

    it('should update the card if given a valid description', async () => {
      const mockCard = {
        id: 'card1',
        name: 'test',
        shortUrl: 'test.com/card1',
        desc: 'this is a test',
      };
      const updatedCard = { ...mockCard, desc: 'New test description' };

      mockGetThreadStarterMessage.mockImplementationOnce(() => ({ id: 'message1' }));
      mockSyncCardData.mockImplementation(() => updatedCard);
      messageMap.set('message1', 'card1');

      await runInThread(client, guild, interaction, run);

      const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;

      expect(mockUpdateCard).toHaveBeenCalledTimes(1);
      expect(mockUpdateCard).toHaveBeenCalledWith(mockCard.id, undefined, 'New test description');

      expect(mockSyncCardData).toHaveBeenCalledTimes(1);
      expect(mockSyncCardData).toHaveBeenCalledWith(channel, mockCard.id);

      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        content: 'This card has been updated!',
        embeds: [updatedCard],
      });
    });
  });
});
