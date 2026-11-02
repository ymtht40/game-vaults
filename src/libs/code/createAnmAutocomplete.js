import { autocompletion } from '@codemirror/autocomplete'
import { ANM_ATTRIBUTE_CATALOG } from '@/libs/code/anmAttributeCatalog'

export function createAnmAutocomplete(attributeNames) {
  const options = attributeNames.map((name) => {
    const meta = ANM_ATTRIBUTE_CATALOG[name] || {}
    const attribute = `data-anm-${name}`
    return meta.type !== 'keyword' && meta.defaultValue
      ? {
          label: `${attribute}="${meta.defaultValue}"`,
          displayLabel: attribute,
          type: 'property',
          detail: meta.detail,
          info: meta.info,
        }
      : {
          label: attribute,
          type: meta.type || 'keyword',
          info: meta.info || `${name} attribute`,
        }
  })

  return autocompletion({
    override: [
      (context) => {
        const word = context.matchBefore(/data-[a-zA-Z0-9-]*/)
        return word && (word.from !== word.to || context.explicit)
          ? { from: word.from, options, validFor: /^data-[a-zA-Z0-9-]*$/ }
          : null
      },
    ],
    icons: false,
  })
}

export default createAnmAutocomplete
