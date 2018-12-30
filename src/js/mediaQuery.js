const BROWSER_DEFAULT_FONT_SIZE = 16

export const MEDIA_QUERY_SMALL = `(min-width: ${576 /
  BROWSER_DEFAULT_FONT_SIZE}em)`
export const MEDIA_QUERY_MEDIUM = `(min-width: ${768 /
  BROWSER_DEFAULT_FONT_SIZE}em)`
export const MEDIA_QUERY_LARGE = `(min-width: ${992 /
  BROWSER_DEFAULT_FONT_SIZE}em)`
export const MEDIA_QUERY_XLARGE = `(min-width: ${1200 /
  BROWSER_DEFAULT_FONT_SIZE}em)`

// extended version of
// https://github.com/Polymer/pwa-helpers/blob/d0ff1d2cc5272a79d83fb130bea41e5ca5d25ea3/media-query.js
export const installMediaQueryWatcher = (mediaQuery, layoutChangedCallback) => {
  const mql = window.matchMedia(mediaQuery)
  const listener = (e) => {
    layoutChangedCallback(e.matches)
  }
  mql.addListener(listener)
  layoutChangedCallback(mql.matches)

  const uninstall = () => {
    mql.removeListener(listener)
  }
  return uninstall
}

