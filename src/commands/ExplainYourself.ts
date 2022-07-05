const ExplainYourself: Command = {
  name: 'explainyourself',
  description: 'Explain the commonmusk workflow',
  run: async (client, interaction) => {
    await interaction.reply({
      content: `I am a bot that helps you brainstorm ideas and plan work.

You can link a discord channel to a trello list with the \`/linkchannel\` command,\
which will allow me to convert messages from that channel into cards\
in that list, and keep them synced up.

When you have discussed an idea and want to make it into a Trello card, hit me with a\
 \`/createitem\` command in the replies of that idea, I'll do the rest.

If a card already exists that you want to link a message to, just say \`/linkitem\` in the rpelies with the card ID.
`,
    });
  },
};

export default ExplainYourself;
