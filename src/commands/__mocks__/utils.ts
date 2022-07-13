const actuals = jest.requireActual('../utils');

module.exports = {
  ...actuals,
  getThreadStarterMessage: jest.fn(),
  syncCardData: jest.fn(),
};
