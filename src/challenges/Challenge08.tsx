/**
 * Implement `mapProps`
 * https://github.com/acdlite/recompose/blob/master/docs/API.md#mapprops
 */

import React, { Component, createElement, SFC, ReactType } from 'react'

/**
 * Implementation
 */

export const mapProps = <P, T extends P = P>(mapper: (props: P) => T) =>
  (BaseComponent: ReactType<T>): SFC<P> =>
    (props: P) => createElement(BaseComponent, mapper(props))

/**
 * Usage
 */

interface Person {
  name: string
  group: string
}

const BasePerson: SFC<Person> = ({ name }) => <h1>{name}</h1>

const BaseGroup: SFC<{ group: Person[] }> = ({ group }) => (
  <ul>
    {group.map(person => <li key={person.name}><BasePerson {...person} /></li>)}
  </ul>
)

const GroupA = mapProps<{ group: Person[] }>(
  ({ group }) => ({ group: group.filter(p => p.group === 'A') })
)(BaseGroup)

export default class extends Component<any> {
  state: { group: Person[] } = { group: [] }
  componentDidMount () {
    fetchData().then(data => this.setState(data)).catch(console.error)
  }
  render () {
    return <GroupA {...this.state} />
  }
}

function fetchData (): Promise<{ group: Person[] }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      group: [
        { name: 'Lucy', group: 'A' },
        { name: 'Jack', group: 'A' },
        { name: 'Carl', group: 'B' },
        { name: 'Jane', group: 'C' },
        { name: 'Kate', group: 'A' }
      ]
    }), 2000)
  })
}
