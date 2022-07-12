import { Client, CommandInteraction, Guild } from 'discord.js';
import { messageMap } from '../appData';
import MockDiscord from '../testUtils/mockDiscord';
import { runOutsideOfThread, runInThread } from '../testUtils/helpers';
import AppendDescription from './AppendDescription';
import { getThreadStarterMessage, syncCardData } from './utils';
import { updateCard, getCard } from '../hooks/trello';

// Setting the type for mocks
const mockGetThreadStarterMessage = <jest.Mock>getThreadStarterMessage;
const mockUpdateCard = <jest.Mock>updateCard;
const mockGetCard = <jest.Mock>getCard;
const mockSyncCardData = <jest.Mock>syncCardData;

jest.mock('../appData');

jest.mock('../hooks/trello', () => ({
  esModule: true,
  updateCard: jest.fn(),
  getCard: jest.fn(),
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

describe('AppendDescription', () => {
  it('should have the correct name property', () => {
    expect(AppendDescription.name).toEqual('appenddescription');
  });
  describe('run function', () => {
    const { run } = AppendDescription;
    const addendum = 'Add this to description';
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;
    let mockDeferReply: jest.Mock;
    let mockFollowUp: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockDiscord = new MockDiscord({
        command: {
          id: 'appenddescription',
          name: 'appenddescription',
          type: 1,
          options: [
            {
              type: 3,
              name: 'addendum',
              value: addendum,
            },
          ],
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
      mockDeferReply = interaction.deferReply as jest.Mock;
      mockFollowUp = interaction.followUp as jest.Mock;
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
      mockGetThreadStarterMessage.mockImplementationOnce(() => ({ id: 'message1' }));

      await runInThread(client, guild, interaction, run);

      const content = 'Error: No Trello card is mapped to message with ID message1';
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content,
      });

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(content);
    });

    it('should update the description when the message is mapped to a card', async () => {
      const mockCard = {
        id: 'card1',
        name: 'test',
        shortUrl: 'test.com/card1',
        desc: 'this is a test',
      };

      const updatedCard = { ...mockCard, desc: `${mockCard.desc}\n\n${addendum}` };

      messageMap.set('message1', mockCard.id);
      mockGetThreadStarterMessage.mockImplementationOnce(() => ({
        id: 'message1',
      }));
      mockGetCard.mockImplementationOnce(() => mockCard);
      mockSyncCardData.mockImplementationOnce(() => updatedCard);

      await runInThread(client, guild, interaction, run);

      expect(mockDeferReply).toHaveBeenCalledTimes(1);

      expect(mockUpdateCard).toHaveBeenCalledTimes(1);
      expect(mockUpdateCard).toHaveBeenCalledWith(mockCard.id, undefined, updatedCard.desc);

      expect(mockSyncCardData).toHaveBeenCalledTimes(1);
      expect(syncCardData).toHaveBeenCalledWith(client.channels.cache.get(interaction.channelId), mockCard.id);

      expect(mockFollowUp).toHaveBeenCalledTimes(1);
      expect(mockFollowUp).toBeCalledWith({
        content: 'This card has been updated!',
        embeds: [updatedCard],
      });
    });
  });
});
