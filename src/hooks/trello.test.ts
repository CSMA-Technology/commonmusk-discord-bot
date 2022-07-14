import fetch from 'node-fetch';
import {
  createCard, getCard, moveCard, updateCard,
} from './trello';
import { convertToMock } from '../testUtils/helpers';

const [mockFetch] = convertToMock([fetch]);

jest.mock('node-fetch');

describe('trello hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCard function', () => {
    it('should return the card data from trello if the request succeeded', async () => {
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
      expect(mockFetch).toBeCalledTimes(1);
      expect(mockFetch).toBeCalledWith(expect.stringMatching(/^https:\/\/api\.trello\.com\/1\/cards\/card1/), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      expect(resultCard).toEqual(card);
    });

    it('should error if trello returned an error', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
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

  describe('create card function', () => {
    it('should create a new card in trello if the request succeeded', async () => {
      const newCard = {
        id: 'card1',
        idList: 'list1',
        name: 'new card name',
        desc: 'new card description',
        shortUrl: 'trello.com/card1',
      };

      mockFetch.mockImplementationOnce((url, init) => Promise.resolve({
        json: () => Promise.resolve({
          ...(JSON.parse(init.body)),
          idList: 'list1',
          id: 'card1',
          shortUrl: 'trello.com/card1',
        }),
        ok: true,
      }));

      const response = await createCard('new card name', 'new card description', 'list1');
      expect(mockFetch).toBeCalledTimes(1);
      expect(mockFetch).toBeCalledWith(expect.stringMatching(/^https:\/\/api\.trello\.com\/1\/cards\?idList=list1/), {
        method: 'POST',
        body: JSON.stringify({
          name: 'new card name',
          desc: 'new card description',
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      expect(response).toEqual(newCard);
    });

    it('should error if trello returned an error', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
      }));

      expect.assertions(1);
      try {
        await createCard('card name', 'card desc', 'list1');
      } catch (e) {
        expect(e).toEqual(new Error('Error! status: 500'));
      }
    });
  });

  describe('move card function', () => {
    it('should call the trello api with a new list ID', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({ id: 'card1' }),
        ok: true,
      }));

      const result = await moveCard('card1', 'list2');
      expect(mockFetch).toBeCalledTimes(1);
      expect(mockFetch).toBeCalledWith(expect.stringMatching(/^https:\/\/api\.trello\.com\/1\/cards\/card1/), {
        method: 'PUT',
        body: JSON.stringify({
          idList: 'list2',
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      expect(result).toEqual('card1');
    });

    it('should error if trello returns an error', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
      }));

      expect.assertions(1);
      try {
        await moveCard('card1', 'list2');
      } catch (e) {
        expect(e).toEqual(new Error('Error! status: 500'));
      }
    });
  });

  describe('update card function', () => {
    it('should call the trello api with a new name if only a name is passed', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({ id: 'card1' }),
        ok: true,
      }));

      const result = await updateCard('card1', 'updated card name');
      expect(mockFetch).toBeCalledTimes(1);
      expect(mockFetch).toBeCalledWith(expect.stringMatching(/^https:\/\/api\.trello\.com\/1\/cards\/card1/), {
        method: 'PUT',
        body: JSON.stringify({
          name: 'updated card name',
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      expect(result).toEqual('card1');
    });

    it('should call the trello api with a new description if only a description is passed', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({ id: 'card1' }),
        ok: true,
      }));

      const result = await updateCard('card1', undefined, 'updated description');
      expect(mockFetch).toBeCalledTimes(1);
      expect(mockFetch).toBeCalledWith(expect.stringMatching(/^https:\/\/api\.trello\.com\/1\/cards\/card1/), {
        method: 'PUT',
        body: JSON.stringify({
          desc: 'updated description',
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      expect(result).toEqual('card1');
    });

    it('should call the trello api with both name and desc if both are passed', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        json: () => Promise.resolve({ id: 'card1' }),
        ok: true,
      }));

      const result = await updateCard('card1', 'updated card name', 'updated description');
      expect(mockFetch).toBeCalledTimes(1);
      expect(mockFetch).toBeCalledWith(expect.stringMatching(/^https:\/\/api\.trello\.com\/1\/cards\/card1/), {
        method: 'PUT',
        body: JSON.stringify({
          name: 'updated card name',
          desc: 'updated description',
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      expect(result).toEqual('card1');
    });

    it('should error if trello returns an error', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 500,
      }));

      expect.assertions(1);
      try {
        await updateCard('card1', 'updated card name', 'updated description');
      } catch (e) {
        expect(e).toEqual(new Error('Error! status: 500'));
      }
    });
  });
});
