import { EditorView } from '@codemirror/view'
import { ACCENT, TRANSPARENT, FOREGROUND, MUTED, VALUE_HIGHLIGHT, BORDER } from '@/libs/code/anmColors'

export const anmEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: TRANSPARENT,
      color: FOREGROUND,
      fontSize: '13px',
      fontFamily: 'var(--font-geist-mono), monospace',
    },
    '.cm-content': { padding: '16px 0', caretColor: ACCENT },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: ACCENT, borderLeftWidth: '2px' },
    '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(255, 122, 50, 0.20)' },
    '.cm-activeLine': { backgroundColor: 'transparent' },
    '.cm-gutters': {
      backgroundColor: TRANSPARENT,
      color: '#6e7681',
      border: 'none',
      paddingLeft: '8px',
    },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#c9d1d9' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 0', minWidth: '32px' },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-line': { padding: '0 16px' },
    '.cm-anm-attr-highlight': { color: `${ACCENT} !important`, fontWeight: '500' },
    '.cm-anm-attr-highlight *': { color: `${ACCENT} !important`, fontWeight: '500' },
    '.cm-anm-attr-highlight span': { color: `${ACCENT} !important` },
    '.cm-anm-value-highlight': { color: `${VALUE_HIGHLIGHT} !important` },
    '.cm-anm-value-highlight *': { color: `${VALUE_HIGHLIGHT} !important` },
    '.cm-tooltip-autocomplete': {
      backgroundColor: 'var(--background)',
      border: `1px solid ${BORDER}`,
      borderRadius: '6px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    },
    '.cm-tooltip-autocomplete ul': {
      fontFamily: 'var(--font-geist-mono), monospace',
      fontSize: '12px',
    },
    '.cm-tooltip-autocomplete ul li': {
      padding: '6px 12px',
      borderBottom: `1px solid ${BORDER}`,
    },
    '.cm-tooltip-autocomplete ul li:last-child': { borderBottom: 'none' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: 'rgba(255, 122, 50, 0.15)',
      color: ACCENT,
    },
    '.cm-completionLabel': { color: FOREGROUND },
    '.cm-completionDetail': { color: MUTED, marginLeft: '8px', fontSize: '11px' },
    '.cm-completionInfo': {
      padding: '8px 12px',
      backgroundColor: TRANSPARENT,
      borderLeft: `1px solid ${BORDER}`,
      color: MUTED,
      fontSize: '11px',
      maxWidth: '250px',
    },
  },
  { dark: true },
)
