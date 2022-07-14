import { Client, CommandInteraction, Guild } from 'discord.js';
import DeleteMetric from './DeleteMetric';
import MockDiscord from '../testUtils/mockDiscord';
import { customMetrics, writeAppData } from '../appData';
import { convertToMock, runOutsideOfThread, runInThread } from '../testUtils/helpers';
import { update } from './SetMetrics';

const [mockWriteAppData, mockUpdate] = convertToMock([writeAppData, update]);

jest.mock('../appData');

jest.mock('./SetMetrics', () => ({
  update: jest.fn(),
}));

describe('DeleteMetric', () => {
  it('should have the correct name property', () => {
    expect(DeleteMetric.name).toEqual('deletemetric');
  });

  describe('run function', () => {
    const { run } = DeleteMetric;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;

    const testMetric = {
      name: 'testMetric',
      description: 'some cool metric',
      min: 69,
      max: 420,
      inverseValue: false,
      type: 4,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      customMetrics.forEach(() => customMetrics.pop());
      mockDiscord = new MockDiscord({
        command: {
          id: 'deletemetric',
          name: 'deletemetric',
          type: 1,
          options: [
            {
              type: 3,
              name: 'name',
              value: testMetric.name,
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
      it('should error when run in a thread', async () => {
        await runInThread(client, guild, interaction, run);
        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: 'This command can only be used in the top level of a channel.',
        });
      });

      it('should error when the metric does not exist', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(jest.fn());
        await runOutsideOfThread(client, guild, interaction, run);

        const expectedError = `Error: No metric found with the name ${testMetric.name}.`;
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);

        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: expectedError,
        });
      });
    });

    describe('succes cases', () => {
      it('should remove the metric from the customMetrics array', async () => {
        const otherMetric = {
          name: 'otherMetric',
          description: 'some lame metric',
          min: 0,
          max: 1,
          inverseValue: true,
          type: 4,
        };
        customMetrics.push(testMetric);
        customMetrics.push(otherMetric);

        await runOutsideOfThread(client, guild, interaction, run);

        expect(customMetrics).toHaveLength(1);
        expect(customMetrics).not.toContainEqual(testMetric);
        expect(customMetrics).toContainEqual(otherMetric);

        expect(mockWriteAppData).toHaveBeenCalledTimes(1);

        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith(client);

        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          content: `Deleted metric: ${testMetric.name}`,
        });
      });
    });
  });
});
