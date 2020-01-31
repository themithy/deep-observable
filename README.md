# Deep-observable

A deep, reactive state container for React. It allows to create one or more
stores in form of nested objects called *observables*. The access on any level
to the object's property from within React component is tracked in an automatic
fashion. Furthermore observer components are organized in a tree-like structure
so only those impacted by a change are updated.

## Introduction

The issue of state management is central to the development process of any
front-end application. In case of the React framework it is also the missing
part. Sophisticated libraries do exist, like Flux, Redux, and Rx.

However it tempting to use just the "JavaScript variables", why not ? In any
case the state is "just a variable", no matter whether it is distributed or
captured in a single, global object. The only issue it to make such objects
"reactive", so that updating theirs value triggers e.g. an update of the
layout.

That is how *deep observable* works. The state is organized in one or many
deep objects that are updated in an imperative manner. Check the following
example, it is simple, isn't it ?

```js
state.counter.value += 1
```

Underneath the object is wrapped with proxy so that we can track reads and
writes. Writing is intercepted to trigger updates and to wrap the inserted
value, in case it is complex. Reads are intercepted too, so that we can build
an index of components that need to re-rendered when an update happens.

```js
const Counter = () => {
  return state.counter.value
}
```

The components marked with observer decorator will track access to observables
on every render. Furthermore the components are organized into a tree so the
least common sub-tree may be chosen for render.  Updates to observables may be
batched in a sort of transaction.  This is all to avoid unnecessary re-renders.

Deep observable is perfect for storing tree-structured data. Updates to nested
data may be performed without clumsy de-structuring. Whole parts of the tree
may be replaced or deleted, because there in no assumption on the schema or
data types.

## Example

```js
import { createObservable, createObserverFactory } from 'deep-observable'

const initialState = { counter: 0 }

const state = createObservable(initialState)
const createObserver = createObserverFactory(state)

const Counter = createObserver(() => {
  return (
    <span
      children={state.counter}
      onClick={() => state.counter++}
    />
})
```

## API

```js
createObservevable(object)
```

Creates an *observable* by wrapping the object with proxy. The function will
traverse the object and wrap any nested objects so that property access can be
tracked on any level.

```js
createObserverFactory(observable)
```

Creates higher-order function for React components and binds it to the
observable.  Any decorated component will be tracked for read access to the
observable and re-rendered when the observable get written.

```js
observable.commit(transaction)
```

Allows transaction-like write access to the observable. The `transaction`
function will be called synchronously and observers will be notified
only after its finish.

```js
observable.createWatch(component, callback)
```

Low-level function that wraps the component to listen for observable access.
The *callback* function will be called on write access to the observable.

## Concepts

It is the `createObservable` function at the core of this library. It creates a
proxy object to the target object which may have any levels of nesting. The
access to the object through the proxy, both read and write, is being tracked.
It is important to note that an access on any level of nesting is tracked,
contrary to other libraries.  The proxy object exposes the same interface as
the target object as `deep-observable` uses native functions under the hood.

React components wrapped by the `createObserver` method will be linked to 
the observable's properties they track. Whenever there is a change in this
property or beneath, the component will be updated. The observes are organized
in a tree-like structure, so the update phase can be optimized.

