import './polyfill'
import 'what-input'
import './components/license/Display'

if (process.env.DEBUG) {
  console.log('development mode')
} else {
  console.log('production mode')
}
