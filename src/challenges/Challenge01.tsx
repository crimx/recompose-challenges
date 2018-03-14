/*
 * Create a SFC that accepts a user name props and renders it.
 * Create a HOC that locks the user name to 'Jack'.
 * Create a HOC that produces the previous HOC, but allows to lock any name.
 * Create a HOC that never updates the base component.
 */

import React, { SFC, ComponentType, ComponentClass } from 'react'

type Diff<T extends string, U extends string> = ({[P in T]: P } &
  {[P in U]: never } & { [x: string]: never })[T]
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>
type Override<Ti, To> = Omit<Ti & To, keyof To> & To

/*
 * Create a SFC that accepts a user name props and renders it.
 */
interface PersonProps {
  name: string
}

const Person: SFC<PersonProps> = ({ name }) => <h1>{name}</h1>

/*
 * Create a HOC that locks the user name to 'Jack'.
 */
interface PersonJackProps {
  name: 'Jack'
}

const PersonJack: SFC<PersonJackProps> = () => <Person name='Jack' />

/*
 * Create a HOC that produces the previous HOC, but allows to lock any name.
 */
function overrideProps<TOutter> (outterProps: TOutter) {
  return function <TInner>(
    BaseComp: ComponentType<TInner>
  ): ComponentType<Override<TInner, TOutter>> {
    return function (innerProps: Override<TInner, TOutter>) {
      return <BaseComp {...innerProps} {...outterProps} />
    }
  }
}

interface PersonLucyProps {
  name: 'Lucy'
}

const anythingNamedLucy = overrideProps<PersonLucyProps>({ name: 'Lucy' })
const PersonLucy = anythingNamedLucy(Person)

/*
 * Create a HOC that never updates the base component.
 */
function neverUpdate<T> (BaseComp: ComponentType<T>): ComponentClass<T> {
  return class extends React.Component<T> {
    shouldComponentUpdate () {
      return false
    }
    render () {
      return <BaseComp {...this.props} />
    }
  }
}

const StaticPerson = neverUpdate(Person)

export default class extends React.Component {
  state = { name: 'Tom' }
  componentDidMount () {
    setInterval(() => this.setState({ name: `Tom ${Date.now()}` }), 1000)
  }
  render () {
    return (
      <>
        <Person name={this.state.name} />
        {/* TypeScript will catch the wrong props, bypassing... */}
        <PersonJack name={this.state.name as any} />
        <PersonLucy name={this.state.name as any} />
        <StaticPerson name={this.state.name} />
      </>
    )
  }
}
