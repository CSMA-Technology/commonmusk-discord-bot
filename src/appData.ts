import { ApplicationCommandOptionData } from 'discord.js';
import { existsSync, PathLike, readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'node:path';

type CustomMetric = ApplicationCommandOptionData & {
  min?: number,
  max?: number,
  inverseValue?: boolean,
};

type AppData = {
  channelMap: Map<string, string>,
  messageMap: Map<string, string>,
  customMetrics: CustomMetric[],
};

// The below functions are helpers for (de)serializing the map when writing the data file
// https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
const mapReplacer = (key: string, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  }
  return value;
};
const mapReviver = (key: string, value: any) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
};

let saveFilePath = process.env.APP_DATA_PATH as PathLike;
let appData: AppData = {
  channelMap: new Map<string, string>(),
  messageMap: new Map<string, string>(),
  customMetrics: [],
};

if (!saveFilePath) {
  saveFilePath = path.join(process.cwd(), 'data', 'appData.json');
  console.log(`No app data path specified, setting saveFilePath to ${saveFilePath}`);
}

if (!existsSync(saveFilePath)) {
  console.log(`No data file found at path: ${saveFilePath}, starting with an empty object`);
} else {
  console.log(`Reading app data values from ${saveFilePath}`);
  appData = { ...appData, ...JSON.parse(readFileSync(saveFilePath, 'utf8'), mapReviver) } as AppData;
}

Object.freeze(appData);

console.log('App Data initialized');

/**
 * Serializes the appData object so that it can be printed or written to a file.
 * @returns The serialized appData object
 */
export const serializeAppData = () => JSON.stringify(appData, mapReplacer);

/**
 * Writes the current configuration to a file at CONFIG_PATH
 * Should be hidden soon, for now needs to be manually called
 */
export const writeAppData = async () => {
  if (!saveFilePath) {
    console.error('Cannot write config, no CONFIG_PATH environment variable given');
  }
  console.log(`Writing config to ${saveFilePath}`);
  await writeFile(saveFilePath, JSON.stringify(appData, mapReplacer));
  console.log('Config succesfully written');
};

export const { channelMap, messageMap, customMetrics } = appData;
