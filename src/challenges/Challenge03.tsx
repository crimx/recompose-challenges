/**
 * Implement the `compose` function which compose multiple HOCs into a single HOC.
 * `compose(a, b, c)(...)` is just a nicer way to achieve `a(b(c(...)))`.
 */

import React, { ReactType, ComponentType, SFC } from 'react'

/**
 * Implementation
 */

// Hardcoded signatures for 2-6 parameters
export function compose<A, B, C> (
  f1: (X: B) => C,
  f2: (X: A) => B
): (X: A) => C
export function compose<A, B, C, D> (
  f1: (X: C) => D,
  f2: (X: B) => C,
  f3: (X: A) => B
): (X: A) => D
export function compose<A, B, C, D, E> (
  f1: (X: D) => E,
  f2: (X: C) => D,
  f3: (X: B) => C,
  f4: (X: A) => B
): (X: A) => E
export function compose<A, B, C, D, E, F> (
  f1: (X: E) => F,
  f2: (X: D) => E,
  f3: (X: C) => D,
  f4: (X: B) => C,
  f5: (X: A) => B
): (X: A) => F
export function compose<A, B, C, D, E, F, G> (
  f1: (X: F) => G,
  f2: (X: E) => F,
  f3: (X: D) => E,
  f4: (X: C) => D,
  f5: (X: B) => C,
  f6: (X: A) => B
): (X: A) => G
export function compose<T> (
  f1: (x: any) => T,
  ...funcs: Function[]
): (x: any) => T

export function compose<T> (
  ...funcs: Function[]
): (x: any) => T {
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

const lowerCaseName = (Comp: ReactType<PersonProps>): SFC<PersonProps> => {
  return (props: PersonProps) => {
    let p = typeof props['name'] === 'string'
      ? { name: props['name'].toLowerCase() }
      : {}
    return <Comp {...props} {...p} />
  }
}

const upperCaseName = (Comp: ReactType<PersonProps>): SFC<PersonProps> => {
  return (props: PersonProps) => {
    let p = typeof props['name'] === 'string'
      ? { name: props['name'].toUpperCase() }
      : {}
    return <Comp {...props} {...p} />
  }
}

const turnEighteen = (Comp: ReactType<PersonProps>): SFC<PersonProps> => {
  return (props: PersonProps) => <Comp {...props} age={18} />
}

const enhance = compose(
  lowerCaseName,
  upperCaseName,
  turnEighteen
)

const EnhancedPerson = enhance(Person)

export default () => <EnhancedPerson name='Sam' age={99} />
