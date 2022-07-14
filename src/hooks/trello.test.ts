import fetch from 'node-fetch';
import { getCard } from './trello';
import { convertToMock } from '../testUtils/helpers';

const [mockFetch] = convertToMock([fetch]);

jest.mock('node-fetch');

describe('trello hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCard function', () => {
    it('should return the card data if trello returned status 200', async () => {
      const card = {
        id: 'card1',
        idList: 'list1',
        name: 'card name',
        desc: 'card desc',
        shortUrl: 'trello.com/card1',
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve(card),
        ok: true,
      }));

      const resultCard = await getCard('card1');
      expect(resultCard).toEqual(card);
    });

    it('should error when trello returned an error', async () => {
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: false,
        status: 500,
      }));

      expect.assertions(1);
      try {
        await getCard('card1');
      } catch (e) {
        expect(e).toEqual(new Error('Error! status: 500'));
      }
    });
  });
});
