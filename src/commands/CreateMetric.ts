import { onlyRunOutsideThread } from './utils';
import { customMetrics, writeAppData } from '../appData';
import { update as updateSetMetrics } from './SetMetrics';

const CreateMetric: Command = {
  name: 'createmetric',
  description: 'Creates a metric that can be added to cards. Value must be an integer',
  options: [
    {
      name: 'name',
      description: 'Name of the metric',
      type: 'STRING',
      required: true,
    },
    {
      name: 'description',
      description: 'Description of the metric',
      type: 'STRING',
      required: true,
    },
    {
      name: 'min',
      description: 'Minimum value for the metric',
      type: 'INTEGER',
    },
    {
      name: 'max',
      description: 'Maximum value for the metric',
      type: 'INTEGER',
    },
    {
      name: 'inversevalue',
      description: 'True if a lower number is better',
      type: 'BOOLEAN',
    },
  ],
  run: onlyRunOutsideThread(async (client, interaction) => {
    const { value: name } = <{ value: string }>interaction.options.get('name', true);
    const { value: description } = <{ value: string }>interaction.options.get('description', true);
    const min = <number | undefined>interaction.options.get('min')?.value;
    const max = <number | undefined>interaction.options.get('max')?.value;
    const inverseValue = <boolean>interaction.options.get('inversevalue')?.value || false;

    if (customMetrics.find((m) => m.name === name)) {
      const content = `Error: Cannot create new metric, a metric with the name ${name} already exists.`;
      console.error(content);
      return interaction.reply({
        ephemeral: true,
        content,
      });
    }

    customMetrics.push({
      name,
      description,
      type: 'INTEGER',
      min,
      max,
      inverseValue,
    });

    writeAppData();
    updateSetMetrics(client);

    const content = `Added a new metric: ${name}`;
    console.log(content);
    return interaction.reply({
      content,
    });
  }),
};

export default CreateMetric;
