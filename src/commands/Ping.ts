import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../Command';

const Ping: Command = {
  name: 'ping',
  description: 'pong',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const content = 'pong';
    console.log('Replying to Ping command');
    await interaction.followUp({
      content,
    });
  },
};

export default Ping;
