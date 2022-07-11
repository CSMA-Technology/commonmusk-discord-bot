import ExplainYourself from './ExplainYourself';
import MockDiscord from '../testUtils/mockDiscord';

describe('ExplainYourself', () => {
  it('should have the correct name property', () => {
    expect(ExplainYourself.name).toEqual('explainyourself');
  });
  describe('run function', () => {
    const { run } = ExplainYourself;
    const mockDiscord = new MockDiscord({ command: 'explainyourself' });
    it('should return a descriptive message', async () => {
      await run(mockDiscord.getClient(), mockDiscord.getInteraction());
      const mockReply = mockDiscord.getInteraction().reply as jest.Mock;
      expect(mockReply).toHaveBeenCalledTimes(1);
      expect(mockReply).toHaveBeenCalledWith(
        { embeds: [{ color: expect.any(Number), title: expect.any(String), description: expect.any(String) }] },
      );
      expect(mockReply.mock.calls[0][0].embeds[0].description.length).toBeGreaterThan(0);
    });
  });
});
