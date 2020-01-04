
import React from 'react'
import { createObservable, createObserverFactory } from 'deep-observable'

const initialState = {
  count: 0,
};

const state = createObservable(initialState)
const createObserver = createObserverFactory(state)

const Counter = createObserver(() => {
  return (
    <span>count: {state.count}</span>
  );
})

const Button = () => {
  return (
    <button
      onClick={() => state.count += 1}
      children="Increment"
    />
  )
}

const App = () => {
  return (
    <React.Fragment>
      <Counter />
      <Button />
    </React.Fragment>
  )
}

export default App

