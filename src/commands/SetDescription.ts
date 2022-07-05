const SetDescription: Command = {
  name: 'setdescription',
  description: 'Sets the description of a card',
  run: async (client, interaction) => {
    console.log('Replying to a SetDescription command');
    await interaction.followUp({
      content: 'Not yet implemented',
    });
  },
};

export default SetDescription;
