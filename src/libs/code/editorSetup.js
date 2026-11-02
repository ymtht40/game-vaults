'use client';

// NOTE: module id: 459643
import { 
  keymap, 
  highlightSpecialChars, 
  drawSelection, 
  highlightActiveLine, 
  dropCursor, 
  rectangularSelection, 
  crosshairCursor, 
  lineNumbers, 
  highlightActiveLineGutter 
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { 
  defaultHighlightStyle, 
  syntaxHighlighting, 
  indentOnInput, 
  bracketMatching, 
  foldGutter, 
  foldKeymap 
} from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { tags as t, HighlightStyle } from '@lezer/highlight';
import { EditorView, Decoration } from '@codemirror/view';
import { ViewPlugin } from '@codemirror/view';

// ---------------------------------------------------------
// Theme Definitions
// ---------------------------------------------------------

const ACCENT_COLOR = "#ff7a32";
const TRANSPARENT = "transparent";
const TEXT_MUTED = "#8b949e";
const TEXT_LIGHT = "#c9d1d9";
const STRING_COLOR = "#a5d6ff";
const NUMBER_COLOR = "#79c0ff";
const KEYWORD_COLOR = "#ff7b72";
const FUNCTION_COLOR = "#d2a8ff";
const VARIABLE_COLOR = "#ffa657";
const BOOLEAN_COLOR = "#79c0ff";
const HIGHLIGHT_VALUE_COLOR = "#ff9a5c";
const BORDER_LIGHT = "rgba(255, 255, 255, 0.08)";

const customTheme = EditorView.theme({
  "&": {
    backgroundColor: TRANSPARENT,
    color: TEXT_LIGHT,
    fontSize: "13px",
    fontFamily: "var(--font-geist-mono), monospace"
  },
  ".cm-content": { padding: "16px 0", caretColor: ACCENT_COLOR },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: ACCENT_COLOR, borderLeftWidth: "2px" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "rgba(255, 122, 50, 0.20)" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-gutters": { backgroundColor: TRANSPARENT, color: "#6e7681", border: "none", paddingLeft: "8px" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#c9d1d9" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 0", minWidth: "32px" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-line": { padding: "0 16px" },
  
  // Custom Data Attributes Highlighting (GSAP/DriveX specific)
  ".cm-anm-attr-highlight": { color: `${ACCENT_COLOR} !important`, fontWeight: "500" },
  ".cm-anm-attr-highlight *": { color: `${ACCENT_COLOR} !important`, fontWeight: "500" },
  ".cm-anm-attr-highlight span": { color: `${ACCENT_COLOR} !important` },
  ".cm-anm-value-highlight": { color: `${HIGHLIGHT_VALUE_COLOR} !important` },
  ".cm-anm-value-highlight *": { color: `${HIGHLIGHT_VALUE_COLOR} !important` },
  
  // Autocomplete Tooltip Styles
  ".cm-tooltip-autocomplete": {
    backgroundColor: "var(--background)",
    border: `1px solid ${BORDER_LIGHT}`,
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)"
  },
  ".cm-tooltip-autocomplete ul": { fontFamily: "var(--font-geist-mono), monospace", fontSize: "12px" },
  ".cm-tooltip-autocomplete ul li": { padding: "6px 12px", borderBottom: `1px solid ${BORDER_LIGHT}` },
  ".cm-tooltip-autocomplete ul li:last-child": { borderBottom: "none" },
  ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "rgba(255, 122, 50, 0.15)", color: ACCENT_COLOR },
  ".cm-completionLabel": { color: TEXT_LIGHT },
  ".cm-completionDetail": { color: TEXT_MUTED, marginLeft: "8px", fontSize: "11px" },
  ".cm-completionInfo": { padding: "8px 12px", backgroundColor: TRANSPARENT, borderLeft: `1px solid ${BORDER_LIGHT}`, color: TEXT_MUTED, fontSize: "11px", maxWidth: "250px" }
}, { dark: true });

const customHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: KEYWORD_COLOR },
  { tag: t.controlKeyword, color: KEYWORD_COLOR },
  { tag: t.moduleKeyword, color: KEYWORD_COLOR },
  { tag: t.operatorKeyword, color: KEYWORD_COLOR },
  { tag: t.definitionKeyword, color: KEYWORD_COLOR },
  { tag: t.string, color: STRING_COLOR },
  { tag: t.special(t.string), color: STRING_COLOR },
  { tag: t.character, color: STRING_COLOR },
  { tag: t.regexp, color: STRING_COLOR },
  { tag: t.number, color: NUMBER_COLOR },
  { tag: t.integer, color: NUMBER_COLOR },
  { tag: t.float, color: NUMBER_COLOR },
  { tag: t.comment, color: TEXT_MUTED },
  { tag: t.lineComment, color: TEXT_MUTED },
  { tag: t.blockComment, color: TEXT_MUTED },
  { tag: t.function(t.variableName), color: FUNCTION_COLOR },
  { tag: t.definition(t.function(t.variableName)), color: FUNCTION_COLOR },
  { tag: t.variableName, color: VARIABLE_COLOR },
  { tag: t.definition(t.variableName), color: VARIABLE_COLOR },
  { tag: t.local(t.variableName), color: VARIABLE_COLOR },
  { tag: t.tagName, color: "#7ee787" },
  { tag: t.angleBracket, color: TEXT_MUTED },
  { tag: t.attributeName, color: "#79c0ff" },
  { tag: t.attributeValue, color: STRING_COLOR },
  { tag: t.className, color: FUNCTION_COLOR },
  { tag: t.labelName, color: FUNCTION_COLOR },
  { tag: t.operator, color: "#ff7b72" },
  { tag: t.punctuation, color: TEXT_LIGHT },
  { tag: t.bracket, color: TEXT_LIGHT },
  { tag: t.squareBracket, color: TEXT_LIGHT },
  { tag: t.brace, color: TEXT_LIGHT },
  { tag: t.paren, color: TEXT_LIGHT },
  { tag: t.separator, color: TEXT_LIGHT },
  { tag: t.derefOperator, color: TEXT_LIGHT },
  { tag: t.propertyName, color: "#79c0ff" },
  { tag: t.bool, color: BOOLEAN_COLOR },
  { tag: t.null, color: BOOLEAN_COLOR },
  { tag: t.typeName, color: VARIABLE_COLOR },
  { tag: t.namespace, color: VARIABLE_COLOR },
  { tag: t.self, color: KEYWORD_COLOR },
  { tag: t.atom, color: BOOLEAN_COLOR }
]);

const baseThemeConfig = [customTheme, syntaxHighlighting(customHighlightStyle)];

// ---------------------------------------------------------
// Custom Animations Attributes Decorations
// ---------------------------------------------------------

const attrMark = Decoration.mark({ class: "cm-anm-attr-highlight" });
const valueMark = Decoration.mark({ class: "cm-anm-value-highlight" });

const customAnimationPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.buildDecorations(view);
  }

  update(update) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view) {
    let builder = new Decoration.set();
    let doc = view.state.doc;
    let marks = [];

    for (let { from, to } of view.visibleRanges) {
      let text = doc.sliceString(from, to);
      let match;
      
      // Match data-anm-* attributes
      const attrRegex = /data-anm-[a-zA-Z0-9-]+/g;
      while ((match = attrRegex.exec(text)) !== null) {
        marks.push({ from: from + match.index, to: from + match.index + match[0].length, decoration: attrMark });
      }

      // Match values of data-anm-*="value"
      const valueRegex = /data-anm-[a-zA-Z0-9-]+="([^"]*)"/g;
      while ((match = valueRegex.exec(text)) !== null) {
        if (match[1]) {
          let valueStart = from + match.index + match[0].indexOf('="') + 2;
          let valueEnd = valueStart + match[1].length;
          if (valueEnd > valueStart) {
            marks.push({ from: valueStart, to: valueEnd, decoration: valueMark });
          }
        }
      }

      // Match Object literal keys (e.g. { "data-anm-xyz": ... })
      const keyRegex = /:\s*"(data-anm-[a-zA-Z0-9-]+)"/g;
      while ((match = keyRegex.exec(text)) !== null) {
        let keyStart = from + match.index + match[0].indexOf('"') + 1;
        let keyEnd = keyStart + match[1].length;
        marks.push({ from: keyStart, to: keyEnd, decoration: attrMark });
      }
    }

    marks.sort((a, b) => a.from - b.from).forEach(({ from, to, decoration }) => {
      builder.add(from, to, decoration);
    });

    return builder.finish();
  }
}, {
  decorations: v => v.decorations
});

const GSAP_ANIMATION_PROPS = {
  "magnetic-button": { type: "keyword", info: "Main magnetic button trigger" },
  "magnetic-text": { type: "keyword", info: "Text element for magnetic effect" },
  "scroll-reveal": { type: "keyword", info: "Scroll-triggered reveal animation" },
  "text-reveal": { type: "keyword", info: "Text reveal animation" },
  "parallax": { type: "keyword", info: "Parallax scrolling effect" },
  "hover": { type: "keyword", info: "Hover animation trigger" },
  "marquee": { type: "keyword", info: "Infinite marquee/ticker" },
  "duration": { defaultValue: "0.8", detail: "seconds", info: "Animation duration in seconds" },
  "delay": { defaultValue: "0", detail: "seconds", info: "Animation delay in seconds" },
  "ease": { defaultValue: "power4.out", detail: "easing", info: "GSAP easing function" },
  "strength": { defaultValue: "25", detail: "number", info: "Effect strength/intensity" },
  "text-strength": { defaultValue: "35", detail: "number", info: "Text element strength" },
  "stagger": { defaultValue: "0.1", detail: "seconds", info: "Stagger delay between items" },
  "direction": { defaultValue: "up", detail: "up/down/left/right", info: "Animation direction" },
  "start": { defaultValue: "top 80%", detail: "position", info: "ScrollTrigger start position" },
  "end": { defaultValue: "bottom 20%", detail: "position", info: "ScrollTrigger end position" },
  "scrub": { defaultValue: "true", detail: "boolean", info: "Scrub animation to scroll" },
  "markers": { defaultValue: "true", detail: "boolean", info: "Show ScrollTrigger markers (debug)" },
  "disable": { defaultValue: "mobile", detail: "viewport", info: "Disable on viewports: mobile, tablet, desktop" },
  "once": { defaultValue: "true", detail: "boolean", info: "Only animate once" },
  "text-magnet": { defaultValue: "true", detail: "boolean", info: "Enable text magnetic effect" },
  "release-ease": { defaultValue: "elastic.out(1,0.3)", detail: "easing", info: "Easing for release animation" },
  "release-duration": { defaultValue: "1.6", detail: "seconds", info: "Duration of release animation" },
  "speed": { defaultValue: "1", detail: "number", info: "Animation speed multiplier" },
  "scale": { defaultValue: "1.1", detail: "number", info: "Scale factor" },
  "rotate": { defaultValue: "0", detail: "degrees", info: "Rotation angle" },
  "y": { defaultValue: "100", detail: "pixels", info: "Y translation" },
  "x": { defaultValue: "0", detail: "pixels", info: "X translation" },
  "opacity": { defaultValue: "0", detail: "0-1", info: "Starting opacity" }
};

function createAutocomplete(attributesList) {
  let options = attributesList.map(attr => {
    let config = GSAP_ANIMATION_PROPS[attr] || {};
    let label = `data-anm-${attr}`;
    
    if (config.type !== "keyword" && config.defaultValue) {
      return {
        label: `${label}="${config.defaultValue}"`,
        displayLabel: label,
        type: "property",
        detail: config.detail,
        info: config.info
      };
    }
    return {
      label: label,
      type: config.type || "keyword",
      info: config.info || `${attr} attribute`
    };
  });

  return autocompletion({
    override: [
      function(context) {
        let match = context.matchBefore(/data-[a-zA-Z0-9-]*/);
        if (!match || (match.from === match.to && !context.explicit)) return null;
        
        return {
          from: match.from,
          options: options,
          validFor: /^data-[a-zA-Z0-9-]*$/
        };
      }
    ],
    icons: false
  });
}

const customAutocomplete = createAutocomplete(Object.keys(GSAP_ANIMATION_PROPS));

// ---------------------------------------------------------
// Main Export (basicSetup equivalent)
// ---------------------------------------------------------

export const baseSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap
  ]),
  ...baseThemeConfig,
  customAnimationPlugin,
  customAutocomplete
];

