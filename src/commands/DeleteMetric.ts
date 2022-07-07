import { onlyRunOutsideThread } from './utils';
import { customMetrics, writeAppData } from '../appData';
import { update as updateSetMetrics } from './SetMetrics';

const DeleteMetric: Command = {
  name: 'deletemetric',
  description: 'Creates a metric that can be added to cards. Value must be an integer',
  options: [
    {
      name: 'name',
      description: 'Name of the metric',
      type: 'STRING',
      required: true,
    },
  ],
  run: onlyRunOutsideThread(async (client, interaction) => {
    const { value: name } = <{ value: string }>interaction.options.get('name', true);

    const metricToRemove = customMetrics.find((m) => m.name === name);

    if (!metricToRemove) {
      const content = `Error: No metric found with the name ${name}.`;
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }

    customMetrics.splice(customMetrics.indexOf(metricToRemove), 1);

    writeAppData();
    updateSetMetrics(client);

    const content = `Deleted metric: ${name}`;
    console.log(content);
    return interaction.reply({
      content,
    });
  }),
};

export default DeleteMetric;
