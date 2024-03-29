import { Client, CommandInteractionOption, ThreadChannel } from 'discord.js';
import { customMetrics, messageMap } from '../appData';
import { getThreadStarterMessage, onlyRunInThread, syncCardData } from './utils';
import { getCard, updateCard } from '../hooks/trello';

const SetMetrics: Command = {
  name: 'setmetrics',
  description: 'Sets the custom metrics for a card',
  options: customMetrics,
  run: onlyRunInThread(async (client, interaction) => {
    const options = <(CommandInteractionOption & { value: Number })[]>interaction.options.data;

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
      if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
        return `Value for ${name} must be at least ${min} and at most ${max}`;
      }
      return null;
    }).filter((e) => e);
    if (optionErrors.length) {
      const content = `Error(s):${optionErrors.map((e) => `\n${e}`)}`;
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }

    const channel = await client.channels.fetch(interaction.channelId) as ThreadChannel;
    const { id: messageId } = await getThreadStarterMessage(client, channel);
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
    const { desc } = await getCard(trelloCardId);

    const metricsRegex = /^metrics:\n(?:\w+:\s*\d+\n{0,1})+/mig;
    let newDescription = desc;
    (metricsRegex.exec(desc) || []).forEach((match) => {
      newDescription = newDescription.replace(match, '');
    });

    if (!newDescription.endsWith('\n')) newDescription += '\n';

    const metricsBlock = `\nMetrics:${options.map((option) => `\n${option.name}: ${option.value}`)}`
      .replaceAll(',', '');

    newDescription = `${newDescription}${metricsBlock}`;

    await updateCard(trelloCardId, undefined, newDescription);

    console.log(`Updated trello card ${trelloCardId} with: ${metricsBlock}`);
    const updatedCardData = await syncCardData(channel, trelloCardId);
    return interaction.followUp({
      content: 'This card has been updated!',
      embeds: [updatedCardData],
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
