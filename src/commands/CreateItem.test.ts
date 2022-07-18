import { Client, CommandInteraction, Guild } from 'discord.js';
import MockDiscord from '../testUtils/mockDiscord';
import CreateItem from './CreateItem';
import { runOutsideOfThread, runInThread, convertToMock } from '../testUtils/helpers';
import { channelMap, messageMap } from '../appData';
import { getThreadStarterMessage, getPrettyCardData } from './utils';
import { createCard } from '../hooks/trello';

// Setting the types for the mocks
const [mockGetThreadStarterMessage, mockCreateCard] = convertToMock([getThreadStarterMessage, createCard]);

jest.mock('../appData');

jest.mock('../hooks/trello');

jest.mock('./utils');

describe('CreateItem', () => {
  it('should have the correct name property', () => {
    expect(CreateItem.name).toEqual('createitem');
  });

  describe('run function', () => {
    const { run } = CreateItem;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      channelMap.clear();
      messageMap.clear();
      mockDiscord = new MockDiscord({
        command: {
          id: 'createitem',
          name: 'createitem',
          type: 1,
          options: [
            {
              type: 3,
              name: 'name',
              value: 'Test Item',
            },
          ],
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
    });

    describe('error cases', () => {
      it('should error when called outside of a thread', async () => {
        await runOutsideOfThread(client, guild, interaction, run);
        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: 'This command can only be used in a thread.',
        });
      });

      it('should error when the channel has no parent ID', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        await runInThread(client, guild, interaction, run);
        const expectedError = `Error: No trello list is mapped for the parent channel: ${undefined}`;
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);
      });

      it('should error when the channel\'s parent is not mapped', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        const threadParentId = 'someChannel';
        await runInThread(client, guild, interaction, run, { threadParentId });
        const expectedError = `Error: No trello list is mapped for the parent channel: ${threadParentId}`;
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);
      });
    });

    describe('successful cases', () => {
      const listId = 'list1';

      const mockCard = {
        id: 'card1',
        name: 'test',
        shortUrl: 'test.com/card1',
        desc: 'this is a test',
        idList: listId,
      };
      const mockMessage = { id: 'message1', content: 'message content' };
      const threadParentId = 'parentChannel1';

      beforeEach(async () => {
        channelMap.set(threadParentId, listId);
        mockGetThreadStarterMessage.mockImplementationOnce(() => mockMessage);
        mockCreateCard.mockImplementationOnce(() => mockCard);
        await runInThread(client, guild, interaction, run, { threadParentId });
      });

      it('should create a new card', async () => {
        expect(mockCreateCard).toHaveBeenCalledTimes(1);
        expect(mockCreateCard).toHaveBeenCalledWith('Test Item', mockMessage.content, listId);
      });

      it('should add the message to the messageMap', () => {
        expect(messageMap.get(mockMessage.id)).toEqual(mockCard.id);
      });

      it('should confirm the operation to the user', () => {
        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          content: 'Created a card in Trello to track this idea. Link details should be below.',
          embeds: [getPrettyCardData(mockCard)],
        });
      });
    });
  });
});
