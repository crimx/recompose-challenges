/**
 * Eager function optimization was removed due to https://github.com/acdlite/recompose/releases/tag/v0.26.0
 * What it does is to replace createElement with function call when possible.
 */

import React, { ReactType, ComponentType, SFC, ComponentClass, ReactNode } from 'react'

function createEagerFactory<T> (type: ReactType<T>) {
  return function<P extends T> (props: P, children?: ReactNode) {
    if (isReferentiallyTransparentFunctionComponent<P>(type)) {
      return children
        ? type({ ...props as any, children })
        : type(props)
    }

    const Component = type
    return children
      ? <Component {...props}>{children}</Component>
      : <Component {...props} />
  }
}

function isReferentiallyTransparentFunctionComponent<P> (type: ReactType<P> | any): type is SFC<P> {
  return Boolean(
    typeof type === 'function' &&
    !isClassComponent(type) &&
    !type.defaultProps &&
    !type.contextTypes
  )
}

function isClassComponent<P> (Component: ReactType<P> | any): Component is ComponentClass<P> {
  return Boolean(
    Component &&
    Component.prototype &&
    typeof Component.prototype.render === 'function'
  )
}

/**
 * Usage
 */

function overrideProps<POverride> (overrideProps: POverride) {
  return function<PBase extends { [k in keyof POverride]: any }> (
    BaseComponent: ComponentType<PBase>
  ): ComponentType<PBase> {
    const factory = createEagerFactory(BaseComponent)

    return function (props) {
      return factory(
        { ...props as any, ...overrideProps as any },
        props['children']
      )
    }
  }
}

const Person: ComponentType<{ name: string }> = ({ name }) =>
  <h1>{name}</h1>

const nameJack = overrideProps<{ name: 'Jack' }>({ name: 'Jack' })
const PersonJack = nameJack(Person)

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
      </>
    )
  }
}
