import {
  Client, CommandInteraction, Guild, TextChannel, ThreadChannel,
} from 'discord.js';
import fetch from 'node-fetch';
import SetDescription from './SetDescription';
import MockDiscord from '../testUtils/mockDiscord';
import { getThreadStarterMessage } from './utils';
import { messageMap } from '../appData';

jest.mock('../appData', () => {
  console.log('We in the mock bitch');
  return {
    messageMap: new Map<string, string>(),
  };
});

jest.mock('./utils', () => {
  const original = jest.requireActual('./utils');
  console.log('Inside utils mock');
  return {
    __esModule: true,
    ...original,
    getThreadStarterMessage: jest.fn(),
  };
});

jest.mock('node-fetch');

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
              value: 'fuck you',
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
      interaction.channelId = '123';
      const channel = Reflect.construct(TextChannel, [guild, {}, client]);
      channel.id = '123';
      client.channels.cache.set('123', channel);

      await run(client, interaction);
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in a thread.',
      });
    });
    it('should error if the thread is not in the message map', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      interaction.channelId = '123';
      const threadChannel = Reflect.construct(ThreadChannel, [guild]);
      threadChannel.id = '123';
      client.channels.cache.set('123', threadChannel);

      (<jest.Mock>getThreadStarterMessage).mockImplementationOnce(() => ({ id: '234' }));

      await run(client, interaction);
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

      (<jest.Mock><unknown>fetch).mockImplementation(async () => ({
        ok: true,
        json: () => mockCard,
      }));
      (<jest.Mock>getThreadStarterMessage).mockImplementationOnce(() => ({ id: 'message1' }));

      interaction.channelId = 'threadChannel1';
      const threadChannel = Reflect.construct(ThreadChannel, [guild]);
      threadChannel.id = 'threadChannel1';
      client.channels.cache.set('threadChannel1', threadChannel);

      messageMap.set('message1', 'card1');
      threadChannel.messages.fetch = () => [];

      await run(client, interaction);

      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        content: 'This card has been updated!',
        embeds: [{
          color: 0x3d8482,
          title: mockCard.name,
          url: mockCard.shortUrl,
          description: mockCard.id,
          fields: [{ name: 'description', value: mockCard.desc }],
        }],
      });
    });
  });
});
