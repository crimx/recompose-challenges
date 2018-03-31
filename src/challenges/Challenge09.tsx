/**
 * Implement `withProps`
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#withprops
 *
 * `withProps` will merge the owner props, which makes the resulted values unable to be overridden.
 * Useful when try to "lock" some of the values.
 */

import React from 'react'

import { branch, renderComponent } from './Challenge06'
import { mapProps } from './Challenge08'

/**
 * Implementation
 */

export const withProps = <P extends {}, T = {}>(input: T | ((props: P) => T)) =>
  mapProps<P, P & T>(props => Object.assign(
    {},
    props,
    (typeof input === 'function' ? input(props) : input)
  ))

/**
 * Usage
 */

interface Person {
  name: string
  color: string
  inactive: boolean
}

const Person = ({ name, color }: Person) => <h1 style={{ color }}>{name}</h1>

const InactivePerson = withProps<Person, Partial<Person>>({ color: 'gray' })(Person)

const DisplayPerson = branch<Person>(
  ({ inactive }) => inactive,
  renderComponent(InactivePerson)
)(Person)

const data: Person[] = [{
  name: 'Jack',
  color: 'navy',
  inactive: false
}, {
  name: 'Tom',
  color: 'teal',
  inactive: true
}, {
  name: 'May',
  color: 'maroon',
  inactive: false
}, {
  name: 'Lucy',
  color: 'orange',
  inactive: true
}]

export default () => (
  <>
    {data.map(DisplayPerson)}
  </>
)
