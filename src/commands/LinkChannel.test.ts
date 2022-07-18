import { Client, CommandInteraction, Guild } from 'discord.js';
import MockDiscord from '../testUtils/mockDiscord';
import { runInThread, runOutsideOfThread, convertToMock } from '../testUtils/helpers';
import LinkChannel from './LinkChannel';
import { channelMap, writeAppData } from '../appData';

const [mockWriteAppData] = convertToMock([writeAppData]);

jest.mock('../appData');

describe('LinkChannel', () => {
  it('should have the correct name property', () => {
    expect(LinkChannel.name).toEqual('linkchannel');
  });

  describe('run function', () => {
    const { run } = LinkChannel;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      channelMap.clear();
      mockDiscord = new MockDiscord({
        command: {
          id: 'linkchannel',
          name: 'linkchannel',
          type: 1,
          options: [
            {
              type: 3,
              name: 'trellolist',
              value: 'List1',
            },
          ],
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
    });

    it('should error when run in a thread', async () => {
      await runInThread(client, guild, interaction, run);
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in the top level of a channel.',
      });
    });

    it('should link a channel in the channelMap', async () => {
      await runOutsideOfThread(client, guild, interaction, run);
      expect(channelMap.size).toBe(1);
      expect(channelMap.get(interaction.channelId)).toEqual('List1');

      expect(mockWriteAppData).toHaveBeenCalledTimes(1);

      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        content: `I have mapped this channel (${interaction.channelId}) to the Trello list with ID List1`,
      });
    });
  });
});
