import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants'

class Header extends Component {
  render () {
    const userId = localStorage.getItem(GC_USER_ID)

    return (
      <div className='flex pal justify-between nowrap orange pa1'>
        <div className='flex flex-fixed black'>
          <Link to='/' className='fw7 mrl no-underline black'>Hacker News</Link>
          <Link to='/new/1' className='ml1 no-underline black'>new</Link>
          <div className='ml1'>|</div>
          <Link to='/search' className='ml1 no-underline black'>search</Link>
          {userId &&
            <div className='flex'>
              <div className='ml1'>|</div>
              <Link to='/create' className='ml1 no-underline black'>submit</Link>
            </div>
          }
        </div>
        <div className='flex flex-fixed'>
          {userId
            ? <div className='ml1 pointer black' onClick={() => {
              localStorage.removeItem(GC_USER_ID)
              localStorage.removeItem(GC_AUTH_TOKEN)
              this.props.history.push('/new/1')
            }}>logout</div>
            : <Link to='/login' className='ml1 no-underline black'>login</Link>
          }
        </div>
      </div>
    )
  }
}

export default withRouter(Header)
