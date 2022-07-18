import {
  Client, Collection, CommandInteraction, Guild, Message, MessageEmbed, ThreadChannel,
} from 'discord.js';
import { getCard } from '../hooks/trello';
import { createThreadChannel } from '../testUtils/helpers';
import MockDiscord from '../testUtils/mockDiscord';
import { messageMap, writeAppData } from '../appData';
import {
  getPrettyCardData, getThreadStarterMessage, linkMessageToTrelloCard, syncCardData,
} from './utils';

const mockGetCard = <jest.Mock>getCard;

jest.mock('../appData');

jest.mock('../hooks/trello', () => ({
  esModule: true,
  getCard: jest.fn(),
}));

describe('utils', () => {
  let mockDiscord: MockDiscord;
  let mockMessage: Message;
  let guild: Guild;
  let interaction: CommandInteraction;
  let client: Client;
  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscord = new MockDiscord({
      message: {
        content: 'test',
      },
      command: {
        id: 'command',
        name: 'somecommand',
        type: 1,
      },
    });
    mockMessage = mockDiscord.getMessage();
    guild = mockDiscord.getGuild();
    interaction = mockDiscord.getInteraction();
    client = mockDiscord.getClient();
  });

  describe('get thread starter message', () => {
    it('should get the message that started the thread', async () => {
      const threadChannel = createThreadChannel(client, guild, interaction, { threadParentId: mockMessage.id });

      const fetchSpy = jest.spyOn(client.channels, 'fetch').mockImplementationOnce(() => threadChannel);
      const fetchStarterMessageSpy = jest.spyOn(threadChannel, 'fetchStarterMessage')
        .mockImplementationOnce(() => mockMessage);

      const message = await getThreadStarterMessage(client, threadChannel);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(mockMessage.id);
      expect(fetchStarterMessageSpy).toHaveBeenCalledTimes(1);
      expect(message).toEqual(mockMessage);
    });
  });

  describe('linking message to trello card', () => {
    it('should link the message with an existing thread', async () => {
      const mockCardId = 'card1';

      const threadChannel = Reflect.construct(ThreadChannel, [guild]);
      threadChannel.id = 'ThreadChannel1';
      const newMessage = { ...mockMessage, thread: threadChannel } as Message;

      linkMessageToTrelloCard(newMessage, mockCardId);
      expect(writeAppData).toBeCalledTimes(1);
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

  describe('sync card data', () => {
    it('should get the latest card and delete the previous message', async () => {
      const mockOriginalCard = {
        id: 'card1',
        name: 'original card name',
        desc: 'original card description',
        shortUrl: 'trello.com/card1',
        idList: 'list1',
      };

      const mockUpdatedCard = {
        id: 'card1',
        name: 'new card name',
        desc: 'new card description',
        shortUrl: 'trello.com/card1',
        idList: 'list1',
      };
      mockGetCard.mockImplementationOnce(() => mockUpdatedCard);

      const threadChannel = createThreadChannel(client, guild, interaction);
      mockMessage.embeds = [getPrettyCardData(mockOriginalCard) as MessageEmbed];

      // mock the channel having one previous message about the card
      const threadChannelMessages = new Collection<String, Message>();
      threadChannelMessages.set(mockMessage.id, mockMessage);

      // fetching channel messages gets this collection
      jest.spyOn(threadChannel.messages, 'fetch')
        .mockImplementation(() => threadChannelMessages);

      // deleting channel messages deletes from this collection
      const deleteSpy = jest.spyOn(mockMessage, 'delete').mockImplementationOnce(() => {
        threadChannelMessages.delete(mockMessage.id);
        return Promise.resolve(mockMessage);
      });

      const channelMessages = await threadChannel.messages.fetch();
      expect(channelMessages.size).toEqual(1);

      const updatedCardData = await syncCardData(threadChannel, 'card1');
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(channelMessages.size).toEqual(0);
      expect(updatedCardData).toEqual({
        color: 0x3d8482,
        title: 'new card name',
        url: 'trello.com/card1',
        description: 'card1',
        fields: [{ name: 'description', value: 'new card description' }],
      });
    });
  });
});
