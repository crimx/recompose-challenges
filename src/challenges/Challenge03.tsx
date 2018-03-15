/**
 * Implement the `compose` function which compose multiple HOCs into a single HOC.
 * `compose` is just a nicer way to achieve `c(b(a()))`-like nested function calls.
 */

import React, { ReactType, ComponentType, SFC } from 'react'

/**
 * Usage
 */

interface PersonProps {
  name: string
  age: number
}

const Person: SFC<PersonProps> = ({ name, age }) => (
  <div>
    <h1>{name}</h1>
    <small>{age}</small>
  </div>
)

const upperCaseName = <T extends {}>(Comp: ReactType<T>): SFC<T & { name: string }> => {
  return (props: T) => {
    let p = typeof props['name'] === 'string'
      ? { name: props['name'].toUpperCase() }
      : {}
    return <Comp {...props} {...p} />
  }
}

const turnEighteen = <T extends {}>(Comp: ReactType<T>): SFC<T & { age: number }> => {
  return (props: T) => <Comp {...props} age={18} />
}

const enhance = compose(
  upperCaseName,
  turnEighteen
)

const EnhancedPerson = enhance(Person)

export default () => <EnhancedPerson name='sam' age={99} />

/**
 * Implementation
 */

type ComponentEnhancer = <PInner, POutter = PInner>(Comp: ReactType<PInner>) => ComponentType<POutter>

function compose (...funcs: Array<Function>): ComponentEnhancer {
  if (funcs.length <= 0) {
    return (arg: any) => arg
  }

  if (funcs.length === 1) {
    return funcs[0] as any
  }

  const innerFunc = funcs[funcs.length - 1]
  const restFunc = funcs.slice(0, -1)
  const reducer = (res: any, fn: Function) => fn(res)

  return function composed (...args: any[]) {
    return restFunc.reduceRight(reducer, innerFunc(...args))
  }
}
