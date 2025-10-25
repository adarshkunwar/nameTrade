const ITEMS_BY_QUERY = `
  query ItemsByQuery($collectionSlug: String!, $query: String!) {
    itemsByQuery(collectionSlug: $collectionSlug, query: $query, limit: 1) {
      id
      name
      tokenId
    }
  }
`;

const COLLECTION_ITEMS_ENDPOINT =
  import.meta.env.VITE_COLLECTION_ITEMS_ENDPOINT || 'https://gql.opensea.io/graphql';

export const getNameFromTokenId = async (tokenId: string): Promise<string | null> => {
  try {
    const response = await fetch(COLLECTION_ITEMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'ItemsByQuery',
        query: ITEMS_BY_QUERY,
        variables: {
          collectionSlug: 'basenames',
          query: tokenId,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const name = json?.data?.itemsByQuery?.[0]?.name;

    return name || null;
  } catch (error) {
    console.error('Failed to fetch name for tokenId:', { tokenId, error });
    return null;
  }
};
