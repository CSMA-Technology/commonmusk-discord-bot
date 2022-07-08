import {
  Client, CommandInteraction, Guild, TextChannel,
} from 'discord.js';
import SetDescription from './SetDescription';
import MockDiscord from '../testUtils/mockDiscord';

// import { messageMap } from '../appData';

jest.mock('../appData', () => {
  console.log('We in the mock bitch');
  return {
    messageMap: new Map<string, string>(),
  };
});

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
    beforeEach(() => {
      jest.clearAllMocks();
      mockDiscord = new MockDiscord({ command: 'setdescription' });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
    });
    it('should only run in a thread', async () => {
      interaction.channelId = '123';
      const channel = Reflect.construct(TextChannel, [guild, {}, client]);
      channel.id = '123';
      client.channels.cache.set('123', channel);

      await run(client, interaction);
      const mockReply = interaction.reply as jest.Mock;
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in a thread.',
      });
    });
  });
});
