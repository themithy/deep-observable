
import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

document.getElementsByTagName('body')[0].innerHTML = '<div id="root"></div>'

ReactDOM.render(<App />, document.getElementById('root')) 

