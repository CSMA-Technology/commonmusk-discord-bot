import { getPrettyCardData } from './utils';

describe('utils', () => {
  describe('get pretty card data', () => {
    it('should return a pretty card message', () => {
      const mockCard = {
        id: 'card1',
        idList: 'list1',
        name: 'the card name',
        shortUrl: 'trello.com/card1',
        desc: 'card description',
      };
      const prettyCardData = getPrettyCardData(mockCard);
      expect(prettyCardData).toEqual({
        color: 0x3d8482,
        title: 'the card name',
        url: 'trello.com/card1',
        description: 'card1',
        fields: [{ name: 'description', value: 'card description' }],
      });
    });
  });
});
