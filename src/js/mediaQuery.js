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

export const MEDIA_QUERY_SMALL = '(min-width: 576px)'
export const MEDIA_QUERY_MEDIUM = '(min-width: 768px)'
export const MEDIA_QUERY_LARGE = '(min-width: 992px)'
export const MEDIA_QUERY_XLARGE = '(min-width: 1200px)'
