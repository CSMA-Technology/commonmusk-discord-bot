import './Bot';
import { Client } from 'discord.js';

jest.mock('./appData');

jest.mock('discord.js', () => {
  class MockClient {
    constructor() {
      if (!MockClient.instance) {
        console.log('Creating Mock Client');
        MockClient.instance = this;
      }
      // eslint-disable-next-line no-constructor-return
      return MockClient.instance;
    }

    private static instance: MockClient;

    public login = jest.fn();

    public on = jest.fn((name: string, cb: Function) => {
      this.handlers.set(name, cb);
    });

    public handlers = new Map<String, Function>();
  }

  return {
    Client: MockClient,
  };
});

describe('Bot', () => {
  const mockClient = new Client({
    intents: [],
  }) as unknown as { login: jest.Mock, handlers: Map<String, Function> };
  it('should login', () => {
    expect(mockClient.login).toHaveBeenCalledTimes(1);
  });

  it.each([['ready'], ['interactionCreate']])('should setup the handler for %s', (name) => {
    expect(mockClient.handlers.has(name)).toBeTruthy();
  });
});
