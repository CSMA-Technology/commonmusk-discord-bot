type ChatInputApplicationCommandData = import('discord.js').ChatInputApplicationCommandData;

type CommandRunFunc = (
  client: import('discord.js').Client, interaction: import('discord.js').BaseCommandInteraction
) => (void | Promise<void>);

interface Command extends ChatInputApplicationCommandData {
  run: CommandRunFunc
}
