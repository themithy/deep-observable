
function isObject(o) {
  return o !== null && typeof o == 'object'
}

export function createObservable(initialState = {}) {

  if (!isObject(initialState)) {
    throw "Initial state must be an object!"
  }

  let watchId = 0
  let dirtyWatches = []
  let dirty = false
  let currentWatch = null

  function applyUpdates(watchList = []) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Apply watches', watchList.map(w => w.id))
    }

    if (dirty) {
      watchList.forEach(watch => {
        if (!dirtyWatches.some(w => w == watch)) {
          dirtyWatches.push(watch)
        }
      })
    }
    else {
      dirtyWatches.forEach(watch => {
        watch.update()
      })
      dirtyWatches = []
      watchList.forEach(watch => {
        watch.update()
      })
    }
  }

  function createLeaf(source, config) {

    const watchHash = {}

    function notify(property, watchWhiteList = [], watchBlackList = []) {
      if (watchHash[property]) {
        watchHash[property].forEach(watch => {
          if (!watchWhiteList.some(w => w == watch) && !watchBlackList.some(w => w == watch)) {
            watchWhiteList.push(watch)
            // blacklist all parents of given watch
            let _watch = watch.parent
            while (_watch) {
              watchBlackList.push(_watch)
              _watch = _watch.parent
            }
          }
        })
      }
      config.propagate(watchWhiteList, watchBlackList)
    }

    function set(target, property, value, receiver) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Set', property, value)
      }

      if (isObject(value)) {
        target[property] = createLeaf(value, { propagate: (...args) => notify(property, ...args) }) 
      }
      else {
        Reflect.set(...arguments)
      }

      notify(property)
      return true
    }

    // wrap function callback to listen for state access
    function createWatch(callback, update) {
      const id = ++watchId
      const watch = { id, update, parent: null }

      function wrapper(...args) {
        watch.parent = currentWatch
        currentWatch = watch
        const ret = callback(...args)
        currentWatch = currentWatch.parent
        return ret
      }
      wrapper.watchId = id

      if (process.env.NODE_ENV === 'development') {
        console.log('Create watch', id)
      }

      return wrapper
    }

    // experimental
    function startWatching(update) {
      const id = ++watchId
      currentWatch = { id, update, parent: currentWatch }
      return id
    }

    // experimental
    function stopWatching(watchId) {
      // watches are organized in LIFO stack.
      if (watchId !== currentWatch.id) {
        throw `Watch id mismatch: ${watchId} !== ${currentWatch.id}.`
      }

      currentWatch = currentWatch.parent
    }

    function commit(receiver, callback) {
      dirty = true
      callback(receiver)
      dirty = false
      applyUpdates()
    }

    /*
    function repeat(callback) {
      startWatching(callback)
      callback()
      stopWatching()
    }
    */

    function get(target, property, receiver) {

      if (property == 'createWatch') {
        return createWatch
      }
      if (property == 'startWatching') {
        return startWatching
      }
      if (property == 'stopWatching') {
        return stopWatching
      }

      if (property == 'commit') {
        return (callback) => commit(receiver, callback)
      }

/*
      if (property == 'repeat') {
        return repeat
      }
      */

      // Check if own property or not defined on prototype chain
      if (target.hasOwnProperty(property) || !Reflect.has(target, property)) {
        if (currentWatch) {
          if (!watchHash[property]) {
            watchHash[property] = [currentWatch]
          }
          else if (!watchHash[property].some(w => w == currentWatch)) {
            watchHash[property].push(currentWatch)
          }
        }
      }

      return Reflect.get(...arguments)
    }

    function deleteProperty(target, property) {
      if (target.hasOwnProperty(property)) {
        notify(property)
        delete target[property]
      }
      return true
    }

    const target = new source.constructor()

    Object.getOwnPropertyNames(source).forEach(prop => {
      if (isObject(source[prop])) {
        target[prop] = createLeaf(source[prop], { propagate: (...args) => notify(prop, ...args) })
      }
      else {
        target[prop] = source[prop]
      }
    })

    return new Proxy(target, { get, set, deleteProperty })
  }

  return createLeaf(initialState, { propagate: applyUpdates })
}

