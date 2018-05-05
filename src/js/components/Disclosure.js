const Disclosure = (root) => {
  const toggle = root.querySelector('.Disclosure__toggle')
  const details = root.querySelector('.Disclosure__details')
  let isExpanded = false
  details.hidden = true
  toggle.setAttribute('aria-expanded', 'false')

  toggle.addEventListener('click', () => {
    details.hidden = isExpanded
    toggle.setAttribute('aria-expanded', !isExpanded)
    isExpanded = !isExpanded
  })
}

export default Disclosure
