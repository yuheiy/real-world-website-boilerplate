import './polyfill.common'
import Disclosure from './Disclosure'

console.log({
  __DEV__: __DEV__,
  __BASE_PATH__: __BASE_PATH__,
})

document.querySelectorAll('.Disclosure').forEach((root) => {
  Disclosure(root)
})
