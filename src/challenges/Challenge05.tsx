/**
 * Implement `lifecycle`
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#lifecycle
 *
 * This is even simplier than the `withStateHandler` in challenge 04.
 * It just adds the hook methods to the HOC class prototype.
 *
 * It doesn't check the method names, which means you can add almost anything(except `render`).
 * But not sure if it's a good idea though, since the doc didn't metion it.
 */

import React, { Component, createElement, ReactType, ComponentClass } from 'react'
import { compose } from './Challenge03'
import { withStateHandlers } from './Challenge04'

/**
 * Implementation
 */

interface ReactLifeCycleFunctionsThisArguments<TProps, TState> {
  props: TProps
  state: TState
  context: any
  refs: {
    [key: string]: React.ReactInstance
  }
  setState<TKeyOfState extends keyof TState> (f: (prevState: TState, props: TProps) => Pick<TState, TKeyOfState>, callback?: () => any): void
  setState<TKeyOfState extends keyof TState> (state: Pick<TState, TKeyOfState>, callback?: () => any): void // tslint:disable-line
  forceUpdate (callBack?: () => any): void

}

interface ReactLifeCycleFunctions<TProps, TState, TInstance = {}> {
  componentWillMount?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance) => void
  componentDidMount?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance) => void
  componentWillReceiveProps?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance, nextProps: TProps) => void
  shouldComponentUpdate?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance, nextProps: TProps, nextState: TState) => boolean
  componentWillUpdate?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance, nextProps: TProps, nextState: TState) => void
  componentDidUpdate?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance, prevProps: TProps, prevState: TState) => void
  componentWillUnmount?: (this: ReactLifeCycleFunctionsThisArguments<TProps, TState> & TInstance) => void
}

export function lifecycle<TProps, TState, TInstance = {}> (
  spec: ReactLifeCycleFunctions<TProps, TState, TInstance> & TInstance
) {
  if (spec.hasOwnProperty('render')) {
    console.error(
      'lifecycle() does not support the render method; its behavior is to ' +
        'pass all props and state to the base component.'
    )
  }

  return (BaseComponent: ReactType<TProps>): ComponentClass<TProps> => {
    class Lifecycle extends Component<TProps, TState> {
      render () {
        return createElement(
          BaseComponent,
          Object.assign({}, this.props, this.state)
        )
      }
    }

    Object.keys(spec).forEach(hook => (Lifecycle.prototype[hook] = spec[hook]))

    return Lifecycle
  }
}

/**
 * Usage
 */

const enchance = compose(
  withStateHandlers(
    { unixms: Date.now() } as { unixms: number },
    { updateUnixms: () => () => ({ unixms: Date.now() }) }
  ),
  lifecycle<{ unixms: number, updateUnixms: Function }, {}>({
    componentDidMount () {
      setInterval(this.props.updateUnixms, 1000)
    }
  })
)

const DisplayDate = ({ unixms }: { unixms: number }) => <h1>{new Date(unixms).toLocaleString()}</h1>

export default enchance(DisplayDate)
