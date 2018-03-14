/**
 * Eager function optimization was removed due to https://github.com/acdlite/recompose/releases/tag/v0.26.0
 */

import React, { ComponentType, ReactNode, SFC, ComponentClass } from 'react'

import { Override } from '../typings/helpers'

window['process'] = { env: { NODE_ENV: 'development' } }

function createEagerFactory<P> (Component: ComponentType<P>) {
  return (props: Readonly<P>, children?: ReactNode) => {
    if (isReferentiallyTransparentFunctionComponent(Component)) {
      return children
        ? Component({ ...props as any, children })
        : Component(props)
    }

    return children
      ? <Component {...props}>{children}</Component>
      : <Component {...props} />
  }
}

function isReferentiallyTransparentFunctionComponent<P> (Component: ComponentType<P> | any): Component is SFC<P> {
  return Boolean(
    typeof Component === 'function' &&
    !isClassComponent(Component) &&
    !Component.defaultProps &&
    !Component.contextTypes &&
    // @ts-ignore
    (window.process.env.NODE_ENV === 'production' || !Component.propTypes)
  )
}

function isClassComponent<P> (Component: ComponentType<P> | any): Component is ComponentClass<P> {
  return Boolean(
    Component &&
    Component.prototype &&
    typeof Component.prototype.isReactComponent === 'object'
  )
}

/**
 * Usage
 */

function overrideProps<POutter> (overrideProps: Readonly<POutter>) {
  return function<PInner> (BaseComponent: ComponentType<PInner>) {
    type PEnhance = Readonly<Override<PInner, POutter>>
    const factory = createEagerFactory(BaseComponent)

    return function (props: PEnhance) {
      return factory(
        { ...props as any, ...overrideProps as any },
        props['children']
      )
    } as ComponentType<PEnhance>
  }
}

const Person: ComponentType<{ name: string }> = ({ name }) =>
  <h1>{name}</h1>

const anythingNamedJack = overrideProps<{ name: 'Jack' }>({ name: 'Jack' })
const PersonJack = anythingNamedJack(Person)

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
      </>
    )
  }
}
