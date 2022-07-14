import { ApplicationCommandOptionData } from 'discord.js';
import Commands from './index';

describe('Commands array', () => {
  it('should be made up entirely of commands', () => {
    const invalidCommand = Commands.find(({
      name, description, run, options, ...rest
    }) => !name || !description || !run || Object.keys(rest).length);
    expect(invalidCommand).toBeUndefined();
  });

  it.each(
    Commands.map((c): [string, ApplicationCommandOptionData[]?] => [c.name, c.options]),
  )('%s should match Discord requirements for all \'name\' keys', (name, options) => {
    expect(name).toEqual(name.toLowerCase());
    expect(name).not.toContain(' ');
    expect(name).not.toContain('\n');

    options?.forEach((o) => {
      expect(o.name).toEqual(o.name.toLowerCase());
      expect(o.name).not.toContain(' ');
      expect(o.name).not.toContain('\n');
    });
  });
});
