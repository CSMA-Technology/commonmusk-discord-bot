import fetch from 'node-fetch';

const baseTrelloUrl: string = 'https://api.trello.com/1/';
// TODO: find a better way to do the auth token generation -- for now since it's just us leaving this here
// eslint-disable-next-line max-len
const authParams: string = 'key=bd812a07b24d1217903e7e4c33e3b9b7&token=ead44e118483d1cff29439200deac604352af3afce7f6f1533576612e5355d61';

export type Card = {
  id: string,
  name: string,
  desc: string,
  idList: string,
};

const parseCardResponse = (id: string, name: string, desc: string, idList: string): Card => ({
  id,
  name,
  desc,
  idList,
});

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
    return parseCardResponse(responseJson.id, responseJson.name, responseJson.desc, responseJson.idList);
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    }
    console.log('unexpected error: ', error);
    return 'An unexpected error occurred.';
  }
};

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

// TODO: need to fix this for updating only the name or the description not both
export const updateCard = async (cardId: string, listId: string, name?: string, desc?: string): Promise<string> => {
  const updateCardUrl: string = `${baseTrelloUrl}/cards/${cardId}?idList${listId}&${authParams}`;
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    }
    console.log('unexpected error: ', error);
    return 'An unexpected error occurred.';
  }
};
