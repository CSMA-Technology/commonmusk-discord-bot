import { BaseCommandInteraction, Client, Interaction } from 'discord.js';
import Commands from '../commands';

const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    console.error(`Error: No command ${interaction.commandName} found for this bot!`);
    interaction.followUp({ content: 'An error has occurred. This command was not found.' });
    return;
  }
  console.log(`Executing run function for ${slashCommand.name}`);
  await slashCommand.run(client, interaction);
};

export default (client: Client): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      console.log(`Slash command ${interaction.commandName} received and being processed`);
      await handleSlashCommand(client, interaction);
    }
  });
};
