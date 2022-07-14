import ready from './ready';
import Commands from '../commands';

const mockClient = {
  on: (name: string, cb: Function) => cb(),
  application: { commands: { set: jest.fn() } },
  user: { username: 'test' },
};

describe('ready handler', () => {
  it('should return if there is no user', () => {
    // @ts-expect-error
    ready({ ...mockClient, user: undefined });

    expect(mockClient.application.commands.set).not.toHaveBeenCalled();
  });

  it('should return if there is no application', () => {
    // @ts-expect-error
    ready({ ...mockClient, application: undefined });

    expect(mockClient.application.commands.set).not.toHaveBeenCalled();
  });

  it('should set the commands', () => {
    // @ts-expect-error
    ready({ ...mockClient });

    expect(mockClient.application.commands.set).toHaveBeenCalledTimes(1);
    expect(mockClient.application.commands.set).toHaveBeenCalledWith(Commands);
  });
});
