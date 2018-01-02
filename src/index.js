import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-client-preset'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { BrowserRouter } from 'react-router-dom'

import registerServiceWorker from './registerServiceWorker'
import './styles/index.css'
import App from './components/App'
import { GC_AUTH_TOKEN } from './constants'
import graphcoolUrl from './secrets'

const httpLink = new HttpLink({ uri: graphcoolUrl })

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

const httpLinkWithToken = middlewareAuthLink.concat(httpLink)

const client = new ApolloClient({
  link: httpLinkWithToken,
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
