import './polyfill'
import 'what-input'
import Disclosure from './components/Disclosure'

if (__DEV__) {
  console.log('development mode')
} else {
  console.log('production mode')
}

document.querySelectorAll('.Disclosure').forEach((el) => {
  Disclosure(el)
})
