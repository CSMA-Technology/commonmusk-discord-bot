/* eslint-disable no-param-reassign */
import {
  Client, CommandInteraction, Guild, TextChannel, ThreadChannel,
} from 'discord.js';

export const createThreadChannel = (
  client: Client,
  guild: Guild,
  interaction: CommandInteraction,
  options?: { threadParentId: string },
) => {
  const threadChannel = Reflect.construct(ThreadChannel, [guild]);
  threadChannel.id = 'ThreadChannel1';
  threadChannel.parentId = options?.threadParentId;
  client.channels.cache.set(threadChannel.id, threadChannel);
  interaction.channelId = threadChannel.id;
  return threadChannel;
};

export const runInThread = (
  client: Client,
  guild: Guild,
  interaction: CommandInteraction,
  run: CommandRunFunc,
  options?: { threadParentId: string },
) => {
  createThreadChannel(client, guild, interaction, options);
  return run(client, interaction);
};

export const runOutsideOfThread = (
  client: Client,
  guild: Guild,
  interaction: CommandInteraction,
  run: CommandRunFunc,
) => {
  const channel = Reflect.construct(TextChannel, [guild, {}, client]);
  channel.id = 'Channel1';
  client.channels.cache.set(channel.id, channel);
  interaction.channelId = channel.id;
  return run(client, interaction);
};

export const convertToMock = (funcs: Function[]) => funcs.map((f) => <jest.Mock>f);
