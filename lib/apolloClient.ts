import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const link = new HttpLink({ uri: 'https://rickandmortyapi.com/graphql', fetch: fetchWithTimeout });
const client = new ApolloClient({
  link: link,  
  cache: new InMemoryCache()
});

export default client;
