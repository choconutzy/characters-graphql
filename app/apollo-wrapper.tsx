"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

const link = new HttpLink({uri: 'https://rickandmortyapi.com/graphql'})
const client = new ApolloClient({
  link: link,  
  cache: new InMemoryCache()
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}