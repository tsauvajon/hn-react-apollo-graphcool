import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { ApolloLink, split } from 'apollo-client-preset'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import registerServiceWorker from './registerServiceWorker'
import App from './components/App'
import { GC_AUTH_TOKEN } from './constants'
import { SUBSCRIPTION_API_ENDPOINT, SIMPLE_API_ENDPOINT } from './secrets'

import './styles/index.css'

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(GC_AUTH_TOKEN)

  const authorizationHeader = token ? `Bearer ${token}` : null

  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })

  return forward(operation)
})

const httpLink = new HttpLink({ uri: SIMPLE_API_ENDPOINT })
const httpLinkWithToken = middlewareAuthLink.concat(httpLink)

const wsLink = new WebSocketLink({
  uri: SUBSCRIPTION_API_ENDPOINT,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(GC_AUTH_TOKEN)
    }
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)

    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLinkWithToken
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root'))

registerServiceWorker()
