/**
 * Implement `renderComponent` and `branch`
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#rendercomponent
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#branch
 *
 * `renderComponent` returns a HOC that ignores input and always render the component from `renderComponent`
 * `branch` validates the props and decides which HOC to render the base component
 */

import React, { createElement, ReactType, ComponentType, SFC } from 'react'
import { compose } from './Challenge03'
import { withStateHandlers } from './Challenge04'
import { lifecycle } from './Challenge05'

/**
 * Implementation
 */

export function renderComponent<P> (Constant: ReactType<P>) {
  return (BaseComponent: ReactType<any>): SFC<P> =>
    (props: P) => <Constant {...props} />
}

export function bracnch<P> (
  test: (props: P) => boolean,
  trueEnhancer: (Comp: ReactType<any>) => ComponentType<any>,
  falseEnhancer: (Comp: ReactType<any>) => ComponentType<any> = (Comp: ComponentType<any>) => Comp
) {
  return (BaseComponent: ReactType<P>): SFC<P> => {
    // Cache components
    let trueComponent: ComponentType<any>
    let falseComponent: ComponentType<any>
    return (props: P) => {
      if (!trueComponent) { trueComponent = trueEnhancer(BaseComponent) }
      if (!falseComponent) { falseComponent = falseEnhancer(BaseComponent) }
      return createElement(test(props) ? trueComponent : falseComponent, props)
    }
  }
}

/**
 * Usage
 */

interface Data {
  msg: string
}

const DisplayData: SFC<{ data: Data }> = ({ data }) => <h1>{data.msg}</h1>

const Loader: SFC<any> = () => <h1 style={{ color: 'red' }}>Loading...</h1>

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
  bracnch<{ data: Data }>(
    props => !props.data,
    renderComponent(Loader)
  )
)

export default enhance<any>(DisplayData)

function fetchData (): Promise<Data> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ msg: 'New data!' }), 2000)
  })
}
