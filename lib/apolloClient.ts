import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
const link = new HttpLink({uri: 'https://rickandmortyapi.com/graphql'})
const client = new ApolloClient({
  link: link,  
  cache: new InMemoryCache()
});

export default client;