import fetch from 'node-fetch';

const baseTrelloUrl: string = 'https://api.trello.com/1';
// TODO: find a better way to do the auth token generation -- for now since it's just us leaving this here
// eslint-disable-next-line max-len
const authParams: string = `key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`;

export type Card = {
  id: string,
  idList: string,
  name: string,
  desc: string,
  shortUrl: string,
};

/**
 * Gets the data from a Trello Card
 * @param cardId the ID of the card
 * @returns Card type with the populated card data
 */
export const getCard = async (cardId: string) => {
  const getCardUrl = `${baseTrelloUrl}/cards/${cardId}?${authParams}`;
  const response = await fetch(getCardUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
  }
  const responseJson = await response.json();
  return ({
    id: responseJson.id,
    name: responseJson.name,
    desc: responseJson.desc,
    idList: responseJson.idList,
    shortUrl: responseJson.shortUrl,
  });
};

/**
 * Creates and pushes a new Trello card to the given list
 * @param name The card name/title
 * @param desc The card description
 * @param listId The ID of the list (column) to add the card to
 * @returns The ID of the newly created card
 */
export const createCard = async (name: string, desc: string, listId: string) => {
  const createCardUrl = `${baseTrelloUrl}/cards?idList=${listId}&${authParams}`;
  const response = await fetch(createCardUrl, {
    method: 'POST',
    body: JSON.stringify({
      name,
      desc,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
  }
  const responseJson = await response.json();
  return ({
    id: responseJson.id,
    name: responseJson.name,
    desc: responseJson.desc,
    idList: responseJson.idList,
    shortUrl: responseJson.shortUrl,
  });
};

/**
 * Moves a card from one list (column) to another
 * @param cardId ID of the card to move
 * @param newListId ID of the new list for the card to be moved to
 * @returns The ID of the updated card
 */
export const moveCard = async (cardId: string, newListId: string) => {
  const moveCardUrl = `${baseTrelloUrl}/cards/${cardId}?${authParams}`;
  const response = await fetch(moveCardUrl, {
    method: 'PUT',
    body: JSON.stringify({
      idList: newListId,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
  }
  const responseJson = await response.json();
  return responseJson.id;
};

/**
 * Updates the data within a given card
 * @param cardId The ID of the card to update
 * @param name The value of the card's name to be updated
 * @param desc The value of the card's description to be updated
 * @returns The ID of the updated card
 */
export const updateCard = async (cardId: string, name?: string, desc?: string) => {
  const updateCardUrl = `${baseTrelloUrl}/cards/${cardId}?${authParams}`;
  const response = await fetch(updateCardUrl, {
    method: 'PUT',
    body: JSON.stringify({
      name,
      desc,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
  }
  const responseJson = await response.json();
  return responseJson.id;
};
