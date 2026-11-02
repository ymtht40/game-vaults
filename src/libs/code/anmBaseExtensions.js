import { syntaxHighlighting } from '@codemirror/language'
import { anmEditorTheme } from '@/libs/code/anmEditorTheme'
import { anmHighlightStyle } from '@/libs/code/anmHighlightStyle'

export const anmBaseExtensions = [anmEditorTheme, syntaxHighlighting(anmHighlightStyle)]
