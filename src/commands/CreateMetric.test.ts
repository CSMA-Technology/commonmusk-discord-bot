import { Client, CommandInteraction, Guild } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import MockDiscord from '../testUtils/mockDiscord';
import { convertToMock, runOutsideOfThread, runInThread } from '../testUtils/helpers';
import CreateMetric from './CreateMetric';
import { customMetrics, writeAppData } from '../appData';
import { update } from './SetMetrics';

const [mockWriteAppData, mockUpdate] = convertToMock([writeAppData, update]);

jest.mock('../appData');

jest.mock('./SetMetrics', () => ({
  update: jest.fn(),
}));

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

    const testMetric = {
      name: 'testMetric',
      description: 'some cool metric',
      min: 69,
      max: 420,
      inverseValue: false,
    };

    const defaultOptions = [
      {
        type: 3,
        name: 'name',
        value: testMetric.name,
      },
      {
        type: 3,
        name: 'description',
        value: testMetric.description,
      },
      {
        type: 4,
        name: 'min',
        value: testMetric.min,
      },
      {
        type: 4,
        name: 'max',
        value: testMetric.max,
      },
      {
        type: 5,
        name: 'inversevalue',
        value: testMetric.inverseValue,
      },
    ];

    const setupMocks = (options: any[] = defaultOptions) => {
      mockDiscord = new MockDiscord({
        command: {
          id: 'createmetric',
          name: 'createmetric',
          type: 1,
          options,
        },
      });
      interaction = mockDiscord.getInteraction();
      client = mockDiscord.getClient();
      guild = mockDiscord.getGuild();
      mockReply = interaction.reply as jest.Mock;
    };

    beforeEach(() => {
      jest.clearAllMocks();
      customMetrics.length = 0;
      setupMocks();
    });

    describe('error cases', () => {
      it('should error when called in a thread', async () => {
        await runInThread(client, guild, interaction, run);
        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: 'This command can only be used in the top level of a channel.',
        });
      });

      it('should error when adding a metric with a name that exists', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(jest.fn());
        customMetrics.push({
          name: testMetric.name,
          description: 'any',
          type: ApplicationCommandOptionTypes.INTEGER,
        });
        await runOutsideOfThread(client, guild, interaction, run);
        // eslint-disable-next-line max-len
        const expectedError = `Error: Cannot create new metric, a metric with the name ${testMetric.name} already exists.`;
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);

        expect(mockReply).toHaveBeenCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: expectedError,
        });
      });
    });

    describe('success cases', () => {
      it('should push to customMetrics', async () => {
        await runOutsideOfThread(client, guild, interaction, run);
        expect(customMetrics).toHaveLength(1);
        expect(customMetrics).toContainEqual({ ...testMetric, type: 'INTEGER' });

        expect(mockWriteAppData).toHaveBeenCalledTimes(1);
      });

      it('should update the SetMetrics command', async () => {
        await runOutsideOfThread(client, guild, interaction, run);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith(client);
      });

      it('should work without optional params', async () => {
        const newOptions = [...defaultOptions.slice(0, 2)];
        setupMocks(newOptions);
        await runOutsideOfThread(client, guild, interaction, run);
        expect(customMetrics).toHaveLength(1);
        expect(customMetrics).toContainEqual({
          ...testMetric, min: undefined, max: undefined, type: 'INTEGER',
        });
      });
    });
  });
});
