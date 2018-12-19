const Disclosure = (root) => {
  const toggle = root.querySelector('.Disclosure__toggle')
  const details = root.querySelector('.Disclosure__details')
  let isExpanded = false

  toggle.addEventListener('click', () => {
    const isNextExpanded = !isExpanded

    toggle.setAttribute('aria-expanded', isNextExpanded)
    details.hidden = !isNextExpanded

    isExpanded = isNextExpanded
  })
}

export default Disclosure
