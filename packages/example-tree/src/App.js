
import React from 'react'
import styled from 'styled-components'
import { createObservable, createObserverFactory } from 'deep-observable'

const initialState = {
  items: [
    { 
      text: 'More items',
      items: [
        { text: 'ABC', items: [] },
        { text: 'DEF', items: [] },
      ]
    }
  ]
}

const state = createObservable(initialState)
const createObserver = createObserverFactory(state)

//state.repeat(() => console.log('Number of items: ' + state.items.length))

state.commit(() => {
  state.items.unshift({ text: '2nd item', items: [] })
  state.items.unshift({ text: '1st item', items: [] })
})

const callback = state.createWatch(() => state.count, () => console.log('Count', state.count))
callback()

state.count = 1
state.count = 2

export const Text = styled.div`
  margin-bottom: 4px;
`

export const Item = styled.div`
  padding: 8px;
  margin: 2px 0;
  border: 1px solid gray;
`

const Leaf = createObserver(({
  leaf,
  onRemove,
  __watchId__,
}) => {

  console.log('Render ', __watchId__)

  return (
    <Item>
      {__watchId__}
      
      { !leaf.edit &&
        <Text
          onDoubleClick={() => leaf.edit = true}
        >
          {leaf.text}
        </Text> }

      { leaf.edit &&
        <input
          value={leaf.text}
          onChange={event => leaf.text = event.target.value}
          onBlur={() => leaf.edit = false}
        /> }

      <button
        onClick={() => leaf.items.commit(s => s.push({ text: 'new item', items: [] }))}
      >
        Insert
      </button>

      { onRemove &&
        <button onClick={onRemove}>
          Remove
        </button> }

      { leaf.items.map((item, i) => {
        return (
          <Leaf
            leaf={item}
            onRemove={() => delete leaf.items[i]}
          />
        );
      })}
    </Item>
  )
})

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const App = () => {
  return (
    <Container>
      <Leaf leaf={state} />
    </Container>
  )
}

export default App

