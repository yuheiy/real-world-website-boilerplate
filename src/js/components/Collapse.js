const Collapse = (root) => {
  const toggle = root.querySelector('.Collapse__toggle')
  const details = root.querySelector('.Collapse__details')
  let isExpanded = false

  toggle.addEventListener('click', () => {
    const isNextExpanded = !isExpanded

    toggle.setAttribute('aria-expanded', isNextExpanded)
    details.hidden = !isNextExpanded

    isExpanded = isNextExpanded
  })
}

export default Collapse
