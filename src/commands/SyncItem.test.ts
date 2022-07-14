import { Client, CommandInteraction, Guild } from 'discord.js';
import MockDiscord from '../testUtils/mockDiscord';
import { convertToMock, runInThread, runOutsideOfThread } from '../testUtils/helpers';
import SyncItem from './SyncItem';
import { syncCardData } from './utils';

const [mockSyncCardData] = convertToMock([syncCardData]);

const mockCard = {
  id: 'Card1',
  desc: 'some card',
};
mockSyncCardData.mockImplementation(() => mockCard);

jest.mock('./utils');
jest.mock('../appData');

describe('SyncItem', () => {
  it('should have the correct name property', () => {
    expect(SyncItem.name).toEqual('sync');
  });

  describe('run function', () => {
    const { run } = SyncItem;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;
    let mockDefer: jest.Mock;
    let mockFollowUp: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
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

    it('should sync the card data', async () => {
      await runInThread(client, guild, interaction, run);

      expect(mockDefer).toHaveBeenCalledTimes(1);
      expect(mockDefer).toHaveBeenCalledWith();

      expect(mockFollowUp).toHaveBeenCalledTimes(1);
      expect(mockFollowUp).toHaveBeenCalledWith({
        embeds: [mockCard],
      });
    });
  });
});
