type ChatInputApplicationCommandData = import('discord.js').ChatInputApplicationCommandData;

interface Command extends ChatInputApplicationCommandData {
  run: (client: import('discord.js').Client, interaction: import('discord.js').BaseCommandInteraction) => (
    void | Promise<void>
  );
}
