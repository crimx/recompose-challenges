/**
 * Implement `withStateHandlers`
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#withstatehandlers
 *
 * Sometimes a component needs to maintain a internal state.
 * This method offers a functional way to do it.
 *
 * The idea is very simple:
 * Create a HOC that wraps the state and methods that can update the state,
 * then expose the method names to base component props.
 *
 * This is also like a shorthand for `compose(withState(), withHandlers())`.
 * The latter offers more flexibility, but generates two layers of HOC.
 */

import React, { Component, createElement, ReactType, ComponentClass } from 'react'
import { shallowEqual } from 'recompose'

/**
 * Implementation
 */

type StateHandler<TState> = <K extends keyof TState>(...payload: any[]) => (Pick<TState, K> | TState)
type StateHandlerMap<TState> = {
  [updaterName: string]: StateHandler<TState>
}
type StateUpdaters<TOutter, TState, TUpdaters> = {
  [updaterName in keyof TUpdaters]: (state: TState, props: TOutter) => StateHandler<TState>
}

export function withStateHandlers<TState, TUpdaters extends StateHandlerMap<TState>, TOutter = {}> (
  initialState: TState | ((input: TOutter) => TState),
  stateUpdaters: StateUpdaters<TOutter, TState, TUpdaters>
) {
  return function <P extends TOutter & TState & TUpdaters>(
    BaseComponent: ReactType<P>
  ): ComponentClass<TOutter> {
    return class WithStateHandlers extends Component<TOutter, TState> {
      state = typeof initialState === 'function'
        ? initialState(this.props)
        : initialState

      updaters = Object.keys(stateUpdaters)
        .reduce((obj, key) => {
          obj[key] = (mayBeEvent?: any, ...payload: any[]) => {
            // Having that functional form of setState can be called async
            // we need to persist SyntheticEvent
            if (mayBeEvent && typeof mayBeEvent.persist === 'function') {
              mayBeEvent.persist()
            }
            this.setState((state, props) =>
              stateUpdaters[key](state, props)(mayBeEvent, ...payload)
            )
          }
          return obj
        }, {})

      shouldComponentUpdate (nextProps: any, nextState: any) {
        const propsChanged = nextProps !== this.props
        // the idea is to skip render if stateUpdater handler return undefined
        // this allows to create no state update handlers with access to state and props
        const stateChanged = !shallowEqual(nextState, this.state)
        return propsChanged || stateChanged
      }

      render () {
        return createElement(
          BaseComponent,
          Object.assign({}, this.props, this.state, this.updaters) as P
        )
      }
    }
  }
}

/**
 * Usage
 * A Person that can only memorize 7 things
 */

const Person = withStateHandlers(
  { memory: [] } as { memory: Array<string | number> },
  {
    memorize: ({ memory }) => (something: string | number) => ({
      memory: memory.slice(-6, memory.length).concat([something])
    })
  }
)(
  ({ memory, memorize, forget }) => {
    const memorizeNumber = () => memorize(Math.floor(Math.random() * 100))
    return (
      <>
        <button onClick={memorizeNumber}>Memorize a random number</button>
        <h1>Memory</h1>
        <ul>
          {/* tslint:disable */}
          {memory.map(thing => <li>{thing}</li>)}
          {/* tslint:enable */}
        </ul>
      </>
    )
  }
)

export default Person
