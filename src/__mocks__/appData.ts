import { ApplicationCommandOptionData } from 'discord.js';

type CustomMetric = ApplicationCommandOptionData & {
  min?: number,
  max?: number,
  inverseValue?: boolean,
};

export const serializeAppData = jest.fn();

export const writeAppData = jest.fn();

export const channelMap = new Map<string, string>();

export const messageMap = new Map<string, string>();

export const customMetrics: CustomMetric[] = [];

console.log('Loaded appData mock');
