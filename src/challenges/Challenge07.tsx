/**
 * Implement `renderNothing`, a HOC that always renders `null`
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#rendernothing
 */

import React, { Component, ComponentClass, SFC } from 'react'
import { compose } from './Challenge03'
import { withStateHandlers } from './Challenge04'
import { lifecycle } from './Challenge05'
import { branch } from './Challenge06'

/**
 * Implementation
 */

class Nothing extends Component<null> {
  render () { return null }
}

export const renderNothing = (Comp: any): ComponentClass<null> => Nothing

/**
 * Usage
 */

interface Data {
  msg: string
}

const DisplayData: SFC<{ data: Data }> = ({ data }) => <h1>{data.msg}</h1>

const enhance = compose(
  withStateHandlers(
    { data: null },
    {
      updateData: () => newData => ({ data: newData })
    }
  ),
  lifecycle<{ updateData: any }, { data: Data}>({
    componentDidMount () {
      fetchData().then(this.props.updateData).catch(console.error)
    }
  }),
  branch<{ data?: Data }>(
    props => !props.data,
    renderNothing
  )
)

export default enhance(DisplayData)

function fetchData (): Promise<Data> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ msg: 'New data!' }), 2000)
  })
}
