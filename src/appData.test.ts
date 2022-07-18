/* eslint-disable max-len, global-require */
import { existsSync, readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { convertToMock } from './testUtils/helpers';

const [mockExistsSync, mockReadFileSync, mockWriteFile] = convertToMock([existsSync, readFileSync, writeFile]);

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('appData', () => {
  const customMetric = { name: 'testMetric', description: 'just a test', type: 'INTEGER' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read from a saved file if present', () => {
    jest.isolateModules(() => {
      const serializedAppData = '{"channelMap":{"dataType":"Map","value":[["testChannel","testList"]]},"messageMap":{"dataType":"Map","value":[["testMessage","testCard"]]},"customMetrics":[{"name":"testMetric","description":"just a test","type":"INTEGER"}]}';
      mockExistsSync.mockImplementationOnce(() => true);
      mockReadFileSync.mockImplementationOnce(() => serializedAppData);
      const { channelMap, messageMap, customMetrics } = require('./appData');

      expect(customMetrics.pop()).toEqual(customMetric);

      expect(channelMap.get('testChannel')).toEqual('testList');

      expect(messageMap.get('testMessage')).toEqual('testCard');
    });
  });
  describe('writeAppData', () => {
    it('should serialize and write the config', () => {
      jest.isolateModules(async () => {
        const {
          customMetrics, channelMap, messageMap, writeAppData,
        } = require('./appData');
        customMetrics.push(customMetric);
        channelMap.set('testChannel', 'testList');
        messageMap.set('testMessage', 'testCard');

        await writeAppData();

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile.mock.calls[0]).toMatchSnapshot();
      });
    });
  });
});
