import './polyfill'
import 'what-input'
import Collapse from './components/Collapse'

if (__DEV__) {
  console.log('development mode')
} else {
  console.log('production mode')
}

document.querySelectorAll('.Collapse').forEach((root) => {
  Collapse(root)
})
