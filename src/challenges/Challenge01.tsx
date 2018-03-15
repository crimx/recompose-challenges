/*
 * Create a SFC that accepts a user name props and renders it.
 * Create a HOC that locks the user name to 'Jack'.
 * Create a HOC that produces the previous HOC, but allows to lock any name.
 * Create a HOC that never updates the base component.
 */

import React, { SFC, ComponentType, ComponentClass } from 'react'

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
function nameJack<T extends { name: any }> (Comp: ComponentType<T>): SFC<T> {
  return (props: T) => <Comp {...props} name='Jack' />
}

const PersonJack = nameJack(Person)

/*
 * Create a HOC that produces the previous HOC, but allows to lock any name.
 */
function overrideProps<POverride> (outterProps: POverride) {
  return function<PBase extends { [k in keyof POverride]: any }> (
    BaseComp: ComponentType<PBase>
  ): SFC<PBase> {
    return innerProps => <BaseComp {...innerProps} {...outterProps} />
  }
}

const nameLucy = overrideProps({ name: 'Lucy' })
const PersonLucy = nameLucy(Person)
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
        <PersonJack name={this.state.name} />
        <PersonLucy name={this.state.name} />
        <StaticPerson name={this.state.name} />
      </>
    )
  }
}
