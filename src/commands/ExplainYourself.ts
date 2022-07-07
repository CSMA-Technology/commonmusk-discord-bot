const helpText = {
  color: 0x3d8482,
  title: 'Commonmusk Help',
  description: `I am a bot that helps you brainstorm ideas and plan work.

\`/linkchannel\`: Links a discord channel to a trello list,
which will allow me to convert messages from that channel into cards
in that list, and keep them synced up.

\`/createitem\`: Hit me with this when you have discussed an idea and want to make it into a Trello card
in the replies of that idea, I'll do the rest.

\`/linkitem\`: If a card already exists that you want to link a message to, use this in the replies with the card ID.
`,
};

const ExplainYourself: Command = {
  name: 'explainyourself',
  description: 'Explain the commonmusk workflow',
  run: async (client, interaction) => {
    await interaction.reply({ embeds: [helpText] });
  },
};

export default ExplainYourself;
