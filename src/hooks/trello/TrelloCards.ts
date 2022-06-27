import fetch from 'node-fetch';

const baseTrelloUrl: string = 'https://api.trello.com/1/';
// TODO: find a better way to do the auth token generation -- for now since it's just us leaving this here
// eslint-disable-next-line max-len
const authParams: string = 'key=bd812a07b24d1217903e7e4c33e3b9b7&token=ead44e118483d1cff29439200deac604352af3afce7f6f1533576612e5355d61';

export type Card = {
  id: string,
  name?: string,
  desc?: string,
  idList: string,
};

/**
 * Gets the data from a Trello Card
 * @param cardId the ID of the card
 * @returns Card type with the populated card data
 */
export const getCard = async (cardId: string): Promise<string | Card> => {
  const getCardUrl: string = `${baseTrelloUrl}/cards/${cardId}?${authParams}`;
  try {
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
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    }
    console.log('unexpected error: ', error);
    return 'An unexpected error occurred.';
  }
};

/**
 * Creates and pushes a new Trello card to the given list
 * @param name The card name/title
 * @param desc The card description
 * @param listId The ID of the list (column) to add the card to
 * @returns The ID of the newly created card
 */
export const createCard = async (name: string, desc: string, listId: string): Promise<string> => {
  const createCardUrl: string = `${baseTrelloUrl}/cards?idList=${listId}&${authParams}`;
  try {
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
    return responseJson.id;
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    }
    console.log('unexpected error: ', error);
    return 'An unexpected error occurred.';
  }
};

/**
 * Moves a card from one list (column) to another
 * @param cardId ID of the card to move
 * @param oldListId ID of the current list that the card is on
 * @param newListId ID of the new list for the card to be moved to
 * @returns The ID of the updated card
 */
export const moveCard = async (cardId: string, oldListId: string, newListId: string): Promise<string> => {
  const moveCardUrl: string = `${baseTrelloUrl}/cards/${cardId}?idList${oldListId}&${authParams}`;
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    }
    console.log('unexpected error: ', error);
    return 'An unexpected error occurred.';
  }
};

/**
 * Updates the data within a given card
 * @param cardData A Card type with the relevant card ID and list ID, plus data to be updated
 * @returns The ID of the updated card
 */
export const updateCard = async (cardData: Card): Promise<string> => {
  const updateCardUrl: string = `${baseTrelloUrl}/cards/${cardData.id}?idList${cardData.idList}&${authParams}`;
  try {
    const response = await fetch(updateCardUrl, {
      method: 'PUT',
      body: JSON.stringify(cardData),
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
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    }
    console.log('unexpected error: ', error);
    return 'An unexpected error occurred.';
  }
};
