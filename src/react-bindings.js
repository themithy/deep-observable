import React from 'react'

export function createObserverFactory(observable) {

  function createObserver(component) {

    if (component.prototype.isReactComponent) {
      throw "React class components cannot be wrapped!";
    }

    const wrappedComponent = (props) => {

      const ref = React.useRef(null)

      const [counter, setCounter] = React.useState(0)

      const forceUpdate = React.useCallback(() => {
        /*
        if (process.env.NODE_ENV === 'development') {
          console.log('Force watch ', ref.current.watchId)
        }
        */
        setCounter(prevCount => prevCount + 1)
      })

      if (!ref.current) {
        ref.current = observable.createWatch(component, forceUpdate)
      }

      return ref.current({ ...props, __watchId__: ref.current.watchId })
    }

    wrappedComponent.displayName = component.displayName | component.name

    return wrappedComponent
  }

  return createObserver;
}

