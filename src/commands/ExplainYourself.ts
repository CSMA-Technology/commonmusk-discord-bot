const helpText = {
  color: 0x3d8482,
  title: 'Commonmusk Help',
  description: `I am a bot that helps you brainstorm ideas and plan work.

\`/linkchannel\`: Links a discord channel to a trello list, 
which will allow me to convert messages from that channel into cards in that list, and keep them synced up.

\`/createitem\`: Hit me with this when you have discussed an idea and want to make it into a Trello card
in the replies of that idea, I'll do the rest.

\`/linkitem\`: If a card already exists that you want to link a message to, use this in the replies with the card ID.

\`/setdescription\`: Updates the description of the card in Trello (overwriting what's already there).

\`/appenddescription\`: Adds to the bottom of the card's description in Trello.

\`/createmetric\`: Creates a custom metric to be tracked in Trello for your cards.

\`/deletemetric\`: Deletes a custom metric.

\`/setmetrics\`: Allows you to set values for your custom metrics on a card (values must be integers).

\`/synccard\`: Manually syncs a card with your Trello board to get the most updated information.
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
