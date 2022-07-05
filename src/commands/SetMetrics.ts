const SetMetrics: Command = {
  name: 'setmetrics',
  description: 'Sets the custom metrics for a card',
  run: async (client, interaction) => {
    console.log('Replying to a SetMetrics command');
    await interaction.followUp({
      content: 'Not yet implemented',
    });
  },
};

export default SetMetrics;
