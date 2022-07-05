const AppendDescription: Command = {
  name: 'appenddescription',
  description: 'Appends to the description of the card linked in this thread',
  run: async (client, interaction) => {
    console.log('Replying to a AppendDescription command');
    await interaction.followUp({
      content: 'Not yet implemented',
    });
  },
};

export default AppendDescription;
