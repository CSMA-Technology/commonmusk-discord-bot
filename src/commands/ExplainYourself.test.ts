import ExplainYourself from './ExplainYourself';
import MockDiscord from '../testUtils/mockDiscord';

describe('/explainyourself command', () => {
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
      expect(mockReply).toHaveBeenCalledWith({ content: expect.any(String) });
      expect(mockReply.mock.calls[0][0].content.length).toBeGreaterThan(0);
    });
  });
});
