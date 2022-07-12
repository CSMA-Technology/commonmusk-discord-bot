import { Message, ThreadChannel } from 'discord.js';
import MockDiscord from '../testUtils/mockDiscord';
import { messageMap, writeAppData } from '../appData';
import { getPrettyCardData, linkMessageToTrelloCard } from './utils';

// Setting the types for the mocks
const mockWriteAppData = <jest.Mock>writeAppData;

jest.mock('../appData', () => ({
  messageMap: new Map<string, string>(),
  writeAppData: jest.fn(),
}));

describe('utils', () => {
  describe('linking message to trello card', () => {
    let mockDiscord: MockDiscord;
    let mockMessage: Message;

    beforeEach(() => {
      jest.clearAllMocks();
      mockDiscord = new MockDiscord({
        message: {
          content: 'test',
        },
      });
      mockMessage = mockDiscord.getMessage();
    });
    it('should link the message with existing thread', async () => {
      const mockCardId = 'card1';

      const threadChannel = Reflect.construct(ThreadChannel, [mockDiscord.getGuild()]);
      threadChannel.id = 'ThreadChannel1';
      const newMessage = { ...mockMessage, thread: threadChannel } as Message;

      await linkMessageToTrelloCard(newMessage, mockCardId);
      expect(mockWriteAppData).toBeCalledTimes(1);
      expect(messageMap).toEqual(new Map().set(mockMessage.id, mockCardId));
    });
  });

  describe('get pretty card data', () => {
    it('should return a pretty card message', () => {
      const mockCard = {
        id: 'card1',
        idList: 'list1',
        name: 'the card name',
        shortUrl: 'trello.com/card1',
        desc: 'card description',
      };
      const prettyCardData = getPrettyCardData(mockCard);
      expect(prettyCardData).toEqual({
        color: 0x3d8482,
        title: 'the card name',
        url: 'trello.com/card1',
        description: 'card1',
        fields: [{ name: 'description', value: 'card description' }],
      });
    });
  });
});
