export function parseAttributesFromJs(source) {
  let match
  if (!source) return []
  const names = new Set()

  const datasetRe = /dataset\.anm([A-Z][a-zA-Z]*)/g
  while ((match = datasetRe.exec(source)) !== null) {
    names.add(match[1].replace(/([A-Z])/g, '-$1').toLowerCase().slice(1))
  }

  const bracketSelectorRe = /\[data-anm-([a-z-]+)\]/g
  while ((match = bracketSelectorRe.exec(source)) !== null) names.add(match[1])

  const animationSelectorRe = /ANIMATION_SELECTOR\s*=\s*["']\[data-anm-([a-z-]+)\]["']/g
  while ((match = animationSelectorRe.exec(source)) !== null) names.add(match[1])

  return Array.from(names)
}

export default parseAttributesFromJs
