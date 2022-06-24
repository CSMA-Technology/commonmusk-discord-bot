import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../Command';

const Hello: Command = {
  name: 'hello',
  description: 'Returns a greeting',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const content = 'Fuck you.';
    console.log('Replying to Hello command');
    await interaction.followUp({
      content,
    });
  },
};

export default Hello;
