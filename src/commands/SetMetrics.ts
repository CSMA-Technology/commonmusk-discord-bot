import { Client, ThreadChannel } from 'discord.js';
import { customMetrics, messageMap } from '../appData';
import { onlyRunInThread } from './utils';
import { getCard, updateCard } from '../hooks/trello';

const SetMetrics: Command = {
  name: 'setmetrics',
  description: 'Sets the custom metrics for a card',
  options: customMetrics,
  run: onlyRunInThread(async (client, interaction) => {
    const options = <{ name: string, value: number }[]>interaction.options.data
      .filter(({ value }) => Number.isInteger(value));

    if (!options.length) {
      const content = 'Error: Must pass at least one metric';
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }

    const optionErrors = options.map(({ name, value }) => {
      const definition = customMetrics.find((c) => c.name === name);
      if (!definition) return `No metric definition exists for ${name}`;
      const { min, max } = definition;
      if ((min && value < min) || (max && value > max)) {
        return `Value for ${name} must be at least ${min} and at most ${max}`;
      }
      return null;
    }).filter((e) => e);
    if (optionErrors.length) {
      const content = `Error(s):\n${optionErrors.map((e) => `\n${e}`)}`;
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }

    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    await client.channels.fetch(channel.parentId!);
    const { id: messageId } = await channel.fetchStarterMessage();
    if (!messageMap.has(messageId)) {
      const content = 'Error: this message is not linked to a Trello card';
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }

    await interaction.deferReply();

    const trelloCardId = messageMap.get(messageId)!;
    const { desc = '' } = await getCard(trelloCardId);

    const metricsRegex = /^metrics:\n(?:\w+:\s*\d+\n{0,1})+/mig;
    let newDescription = desc;
    (metricsRegex.exec(desc) || []).forEach((match) => {
      newDescription = newDescription.replace(match, '');
    });

    if (!newDescription.endsWith('\n')) newDescription += '\n';

    const metricsBlock = `\nMetrics:${options.map((option) => `\n${option.name}: ${option.value}`)}`.replace(',', '');

    newDescription = `${newDescription}${metricsBlock}`;

    await updateCard(trelloCardId, undefined, newDescription);

    const content = `Updated trello card ${trelloCardId} with: ${metricsBlock}`;
    console.log(content);
    return interaction.followUp({
      content,
    });
  }),
};

export const update = async (client: Client) => {
  const commands = await client.application?.commands.fetch();
  const thisCommand = commands?.find((c) => c.name === SetMetrics.name);
  if (!thisCommand) {
    console.error(`Error updating command: No command found in client with name ${SetMetrics.name}`);
    return;
  }
  await client.application!.commands.edit(thisCommand, SetMetrics);
  console.log(`Updated ${SetMetrics.name} command`);
};

export default SetMetrics;
