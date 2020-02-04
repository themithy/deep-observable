import { createObservable } from '../src/core';

// -----

test('disjunctive watches', () => {
  const observable = createObservable({ a: 1, b: 2 })

  const fnA = () => observable.a
  const fnB = () => observable.b

  const updateA = jest.fn()
  const updateB = jest.fn()

  const watchA = observable.createWatch(fnA, updateA)
  const watchB = observable.createWatch(fnB, updateB)

  watchA()
  watchB()

  observable.a = 3

  expect(updateA).toBeCalledTimes(1)
  expect(updateB).toBeCalledTimes(0)
})

