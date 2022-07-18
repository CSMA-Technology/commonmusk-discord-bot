import interactionCreate from './interactionCreate';
import Commands from '../commands';

const mockInteraction = {
  isCommand: jest.fn(() => true),
  isContextMenu: jest.fn(() => true),
  commandName: 'test',
  reply: jest.fn(),
};

jest.mock('../commands', () => [
  {
    name: 'test',
    run: jest.fn(),
  },
]);

const mockClient = {
  on: (name: string, cb: Function) => cb(mockInteraction),
  application: { commands: { set: jest.fn() } },
  user: { username: 'test' },
};

describe('interactionCreate handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInteraction.commandName = 'test';
  });

  it('should do nothing if the interaction is not a command or context menu action', () => {
    mockInteraction.isCommand.mockImplementationOnce(() => false);
    mockInteraction.isContextMenu.mockImplementationOnce(() => false);
    // @ts-expect-error
    interactionCreate(mockClient);
    expect(mockInteraction.reply).not.toHaveBeenCalled();
    const [testCommand] = Commands;
    expect(testCommand.run).not.toHaveBeenCalled();
  });

  it('should call the run function of the command', () => {
    // @ts-expect-error
    interactionCreate(mockClient);
    const [testCommand] = Commands;
    expect(testCommand.run).toHaveBeenCalledTimes(1);
    expect(testCommand.run).toHaveBeenCalledWith(mockClient, mockInteraction);
  });

  it('should error when the command is not found', () => {
    jest.spyOn(console, 'error').mockImplementationOnce(jest.fn());
    mockInteraction.commandName = 'notThere';
    // @ts-expect-error
    interactionCreate(mockClient);
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledWith(
      { content: 'An error has occurred. This command was not found.' },
    );
  });
});
