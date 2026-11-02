import { ViewPlugin } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { attributeNameMark, attributeValueMark } from '@/libs/code/anmAttributeMarks'

class AnmAttributeHighlighter {
  decorations

  constructor(view) {
    this.decorations = this.buildDecorations(view)
  }

  update(update) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view)
    }
  }

  buildDecorations(view) {
    const builder = new RangeSetBuilder()
    const doc = view.state.doc
    const ranges = []

    for (const { from, to } of view.visibleRanges) {
      let match
      const text = doc.sliceString(from, to)

      // 1) every data-anm-* attribute name
      const attributeNameRe = /data-anm-[a-zA-Z0-9-]+/g
      while ((match = attributeNameRe.exec(text)) !== null) {
        const start = from + match.index
        ranges.push({ from: start, to: start + match[0].length, decoration: attributeNameMark })
      }

      // 2) the quoted value in data-anm-*="value"
      const attributeValueRe = /data-anm-[a-zA-Z0-9-]+="([^"]*)"/g
      while ((match = attributeValueRe.exec(text)) !== null) {
        if (match[1]) {
          const start = from + match.index + match[0].indexOf('="') + 2
          const end = start + match[1].length
          if (end > start) ranges.push({ from: start, to: end, decoration: attributeValueMark })
        }
      }

      // 3) key: "data-anm-*" string values in JS
      const jsAttributeRe = /:\s*"(data-anm-[a-zA-Z0-9-]+)"/g
      while ((match = jsAttributeRe.exec(text)) !== null) {
        const start = from + match.index + match[0].indexOf('"') + 1
        ranges.push({ from: start, to: start + match[1].length, decoration: attributeNameMark })
      }
    }

    ranges.sort((a, b) => a.from - b.from)
    for (const { from, to, decoration } of ranges) builder.add(from, to, decoration)
    return builder.finish()
  }
}

export const anmAttributeHighlighter = ViewPlugin.fromClass(AnmAttributeHighlighter, {
  decorations: (plugin) => plugin.decorations,
})

