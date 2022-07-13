import { Client, CommandInteraction, Guild } from 'discord.js';
import MockDiscord from '../testUtils/mockDiscord';
import { convertToMock, runOutsideOfThread, runInThread } from '../testUtils/helpers';
import CreateMetric from './CreateMetric';
import { customMetrics, writeAppData } from '../appData';

jest.mock('../appData');

describe('CreateMetric', () => {
  it('should have the correct name property', () => {
    expect(CreateMetric.name).toEqual('createmetric');
  });

  describe('run function', () => {
    const { run } = CreateMetric;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockDiscord = new MockDiscord({
        command: {
          id: 'createitem',
          name: 'createitem',
          type: 1,
          options: [
            {
              type: 3,
              name: 'name',
              value: 'test metric',
            },
            {
              type: 3,
              name: 'description',
              value: 'some cool metric',
            },
          ],
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
    });

    it('should error when called in a thread', async () => {
      await runInThread(client, guild, interaction, run);
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in the top level of a channel.',
      });
    });
  });
});
