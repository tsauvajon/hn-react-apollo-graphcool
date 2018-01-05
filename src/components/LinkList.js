import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import Link from './Link'

class LinkList extends Component {
  render () {
    if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
      return <div>Loading</div>
    }

    if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
      return <div>Error</div>
    }

    const linksToRender = this.props.allLinksQuery.allLinks

    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link key={link.id} index={index} link={link} updateStoreAfterVote={this._updateCacheAfterVote} />
        ))}
      </div>
    )
  }

  componentDidMount() {
    this._subscribeToNewLinks()
    this._subscribeToNewVotes()
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: ALL_LINKS_QUERY })

    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }

  _subscribeToNewLinks = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: LINK_CREATED_SUBSCRIPTION,
      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [
          subscriptionData.data.Link.node,
          ...previous.allLinks
        ]

        const result = {
          ...previous,
          allLinks: newAllLinks
        }

        return result
      }
    })
  }

  _subscribeToNewVotes = () => {
    this.props.allLinksQuery.subscribeToMore({
      document: VOTE_CREATED_SUBSCRIPTION,
      updateQuery: (previous, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.data.Vote.node.link.id)
        const link = subscriptionData.Vote.node.link
        const newAllLinks = previous.allLinks.slice()

        newAllLinks[votedLinkIndex] = link

        const result = {
          ...previous,
          allLinks: newAllLinks
        }

        return result
      }
    })
  }
}

export const ALL_LINKS_QUERY = gql`
query AllLinksQuery {
  allLinks {
    id
    createdAt
    url
    description
    postedBy {
      id
      name
    }
    votes {
      id
      user {
        id
      }
    }
  }
}
`

const LINK_CREATED_SUBSCRIPTION = gql`
subscription {
  Link(filter: {
    mutation_in: [CREATED]
  }) {
    node {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
}
`

const VOTE_CREATED_SUBSCRIPTION = gql`
subscription {
  Vote(filter: {
    mutation_in: [CREATED]
  }) {
    node {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
}
`

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' })(LinkList)
