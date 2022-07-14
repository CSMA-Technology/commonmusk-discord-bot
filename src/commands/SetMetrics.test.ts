import { Client, CommandInteraction, Guild } from 'discord.js';
import SetMetrics, { update } from './SetMetrics';
import { customMetrics, messageMap, writeAppData } from '../appData';
import { getThreadStarterMessage, syncCardData } from './utils';
import { getCard, updateCard } from '../hooks/trello';
import { convertToMock, runInThread, runOutsideOfThread } from '../testUtils/helpers';
import MockDiscord from '../testUtils/mockDiscord';

jest.mock('./utils');
jest.mock('../appData');
jest.mock('../hooks/trello');

const [mockGetThreadStarterMessage, mockWriteAppData, mockGetCard, mockUpdateCard, mockSyncCardData] = convertToMock(
  [getThreadStarterMessage, writeAppData, getCard, updateCard, syncCardData],
);

const mockMessage = { id: 'Message1', content: 'some content' };
mockGetThreadStarterMessage.mockImplementation(() => mockMessage);

const mockCard = { id: 'Card1', desc: 'Some description' };
mockGetCard.mockImplementation((cardId) => (cardId === mockCard.id ? mockCard : null));

describe('SetMetrics', () => {
  it('should have the correct name property', () => {
    expect(SetMetrics.name).toEqual('setmetrics');
  });

  describe('run function', () => {
    const { run } = SetMetrics;
    let mockDiscord: MockDiscord;
    let interaction: CommandInteraction;
    let client: Client;
    let guild: Guild;
    let mockReply: jest.Mock;
    let mockDefer: jest.Mock;
    let mockFollowUp: jest.Mock;

    const validOptions = [
      {
        type: 4,
        name: 'metric1',
        value: 1,
      },
      {
        type: 4,
        name: 'metric2',
        value: 3,
      },
      {
        type: 4,
        name: 'metric3',
        value: 200,
      },
    ];

    const invalidOptions = [
      {
        type: 4,
        name: 'metric1',
        value: -1,
      },
      {
        type: 4,
        name: 'metric2',
        value: 6,
      },
      {
        type: 4,
        name: 'metric4',
        value: 200,
      },
    ];

    const setupMocks = (options: any[]) => {
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
      mockDefer = interaction.deferReply as jest.Mock;
      mockFollowUp = interaction.followUp as jest.Mock;
    };

    beforeEach(() => {
      jest.clearAllMocks();
      messageMap.clear();
      customMetrics.length = 0;
      customMetrics.push(
        {
          name: 'metric1', description: 'first metric', type: 'INTEGER', min: 0, max: 10,
        },
        {
          name: 'metric2', description: 'second metric', type: 'INTEGER', min: 0, max: 5,
        },
        {
          name: 'metric3', description: 'third metric', type: 'INTEGER',
        },
      );
      setupMocks([]);
    });

    it('should error when run outside of a thread', async () => {
      await runOutsideOfThread(client, guild, interaction, run);
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith({
        ephemeral: true,
        content: 'This command can only be used in a thread.',
      });
    });

    describe('error cases', () => {
      const errorSpy = jest.spyOn(console, 'error');
      beforeEach(() => {
        errorSpy.mockImplementationOnce(jest.fn());
      });
      it('should return an error when no metrics are passed', async () => {
        setupMocks([]);

        await runInThread(client, guild, interaction, run);

        const expectedError = 'Error: Must pass at least one metric';

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);

        expect(mockReply).toBeCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: expectedError,
        });
      });

      it('should return all errors for invalid option values', async () => {
        setupMocks(invalidOptions);

        await runInThread(client, guild, interaction, run);

        // eslint-disable-next-line no-multi-str
        const expectedError = `Error(s):
Value for metric1 must be at least 0 and at most 10,
Value for metric2 must be at least 0 and at most 5,
No metric definition exists for metric4`;

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);

        expect(mockReply).toBeCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: expectedError,
        });
      });

      it('should error when the message is not linked to a card', async () => {
        setupMocks(validOptions);

        await runInThread(client, guild, interaction, run);

        const expectedError = 'Error: this message is not linked to a Trello card';

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expectedError);

        expect(mockReply).toBeCalledTimes(1);
        expect(mockReply).toHaveBeenCalledWith({
          ephemeral: true,
          content: expectedError,
        });
      });
    });

    describe('success cases', () => {
      beforeEach(() => {
        messageMap.set(mockMessage.id, mockCard.id);
      });

      it('should set the metrics when all options are valid', async () => {
        setupMocks(validOptions);
        const [metric1, metric2, metric3] = validOptions;
        const expectedDescription = `Some description\n
Metrics:
${metric1.name}: ${metric1.value}
${metric2.name}: ${metric2.value}
${metric3.name}: ${metric3.value}`;

        mockSyncCardData.mockImplementationOnce(() => ({
          ...mockCard,
          desc: expectedDescription,
        }));

        await runInThread(client, guild, interaction, run);

        expect(mockDefer).toHaveBeenCalledTimes(1);
        expect(mockDefer).toHaveBeenCalledWith();

        expect(mockUpdateCard).toBeCalledTimes(1);

        expect(mockUpdateCard).toBeCalledWith(mockCard.id, undefined, expectedDescription);

        expect(mockSyncCardData).toHaveBeenCalledTimes(1);
        expect(mockSyncCardData).toHaveBeenCalledWith(interaction.channel, mockCard.id);

        expect(mockFollowUp).toHaveBeenCalledTimes(1);
        expect(mockFollowUp).toHaveBeenCalledWith({
          content: 'This card has been updated!',
          embeds: [{ ...mockCard, desc: expectedDescription }],
        });
      });

      it('should set a subset of valid metrics', async () => {
        const [metric1,, metric3] = validOptions;
        setupMocks([metric1, metric3]);
        const expectedDescription = `Some description\n
Metrics:
${metric1.name}: ${metric1.value}
${metric3.name}: ${metric3.value}`;

        mockSyncCardData.mockImplementationOnce(() => ({
          ...mockCard,
          desc: expectedDescription,
        }));

        await runInThread(client, guild, interaction, run);

        expect(mockDefer).toHaveBeenCalledTimes(1);
        expect(mockDefer).toHaveBeenCalledWith();

        expect(mockUpdateCard).toBeCalledTimes(1);

        expect(mockUpdateCard).toBeCalledWith(mockCard.id, undefined, expectedDescription);

        expect(mockSyncCardData).toHaveBeenCalledTimes(1);
        expect(mockSyncCardData).toHaveBeenCalledWith(interaction.channel, mockCard.id);

        expect(mockFollowUp).toHaveBeenCalledTimes(1);
        expect(mockFollowUp).toHaveBeenCalledWith({
          content: 'This card has been updated!',
          embeds: [{ ...mockCard, desc: expectedDescription }],
        });
      });

      it('should replace existing metrics in the card', async () => {
        const cardWithMetrics = {
          ...mockCard,
          desc: 'Some description\nmetrics:\nmetric1: 2',
        };
        mockGetCard.mockImplementationOnce(() => cardWithMetrics);

        setupMocks(validOptions);

        const [metric1, metric2, metric3] = validOptions;
        const expectedDescription = `Some description\n
Metrics:
${metric1.name}: ${metric1.value}
${metric2.name}: ${metric2.value}
${metric3.name}: ${metric3.value}`;

        mockSyncCardData.mockImplementationOnce(() => ({
          ...mockCard,
          desc: expectedDescription,
        }));

        await runInThread(client, guild, interaction, run);

        expect(mockDefer).toHaveBeenCalledTimes(1);
        expect(mockDefer).toHaveBeenCalledWith();

        expect(mockUpdateCard).toBeCalledTimes(1);

        expect(mockUpdateCard).toBeCalledWith(mockCard.id, undefined, expectedDescription);

        expect(mockSyncCardData).toHaveBeenCalledTimes(1);
        expect(mockSyncCardData).toHaveBeenCalledWith(interaction.channel, mockCard.id);

        expect(mockFollowUp).toHaveBeenCalledTimes(1);
        expect(mockFollowUp).toHaveBeenCalledWith({
          content: 'This card has been updated!',
          embeds: [{ ...mockCard, desc: expectedDescription }],
        });
      });
    });
  });

  describe('update function', () => {
    let mockDiscord: MockDiscord;

    beforeEach(() => {
      mockDiscord = new MockDiscord({
        command: {
          id: 'createmetric',
          name: 'createmetric',
          type: 1,
          options: [],
        },
      });
    });

    it('should error when the command is not in the client', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementationOnce(jest.fn());
      await update(mockDiscord.getClient());

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Error updating command: No command found in client with name ${SetMetrics.name}`,
      );
    });

    it('should call the edit function for this command', async () => {
      // @ts-expect-error
      mockDiscord.getClient().application = { commands: { fetch: jest.fn(() => [SetMetrics]), edit: jest.fn() } };

      await update(mockDiscord.getClient());

      expect(mockDiscord.getClient().application!.commands.edit).toHaveBeenCalledTimes(1);
      expect(mockDiscord.getClient().application!.commands.edit).toHaveBeenCalledWith(SetMetrics, SetMetrics);
    });
  });
});
