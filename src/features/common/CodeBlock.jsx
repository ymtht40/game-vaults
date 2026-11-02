'use client';

// Variable Mapping: p -> DEFAULT_FILENAMES, e -> children / state, f -> language, m -> filename, x -> copyable, g -> className, h -> maxHeight, y -> fontSize, w -> brandIndicator, b -> headerless, v -> isCopied, j -> setIsCopied, V -> editorContainerRef, E -> editorViewRef, H -> codeText, M -> handleCopy, O -> displayFilename

import { useState, useRef, useEffect } from 'react';
import { EditorView } from '@codemirror/view'; // NOTE: module id: 115080
import { EditorState } from '@codemirror/state'; // NOTE: module id: 356421
import { html } from '@codemirror/lang-html'; // NOTE: module id: 724433
import { css } from '@codemirror/lang-css'; // NOTE: module id: 73840
import { javascript } from '@codemirror/lang-javascript'; // NOTE: module id: 837153
import { Check, Copy } from '@phosphor-icons/react'; // NOTE: module id: 499839, 999723
import { basicSetup } from '@/libs/code';
import { anmThemeExtensions } from '@/libs/code/anmThemeExtensions'; // NOTE: module id: 412715

const DEFAULT_FILENAMES = {
  html: 'example.html',
  css: 'styles.css',
  javascript: 'script.js',
  js: 'script.js',
  jsx: 'Component.jsx',
  vue: 'Component.vue',
};

function getLanguageExtension(lang) {
  switch (lang) {
    case 'css':
      return css();
    case 'javascript':
    case 'js':
      return javascript();
    case 'jsx':
      return javascript({ jsx: true });
    default:
      return html();
  }
}

// NOTE: module id: 317840
export default function CodeBlock({
  children,
  language = 'html',
  filename,
  copyable = true,
  className = '',
  maxHeight = '256px',
  fontSize = '13px',
  brandIndicator = false,
  headerless = false,
}) {
  const [isCopied, setIsCopied] = useState(false);
  const editorContainerRef = useRef(null);
  const editorViewRef = useRef(null);
  const codeText = typeof children === 'string' ? children : String(children);

  useEffect(() => {
    if (!editorContainerRef.current) return;

    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }

    const state = EditorState.create({
      doc: codeText,
      extensions: [
        basicSetup,
        getLanguageExtension(language),
        ...anmThemeExtensions,
        EditorView.editable.of(false),
        EditorView.lineWrapping,
      ],
    });

    editorViewRef.current = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [codeText, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayFilename =
    filename || DEFAULT_FILENAMES[language] || language.toUpperCase();

  return (
    <div
      className={`flex h-full flex-col bg-background ${
        headerless ? '' : 'border border-foreground/10'
      } ${className}`}
    >
      {!headerless && (
        <div className="flex items-center justify-between border-b border-foreground/10 bg-foreground/[0.04] px-12 py-8">
          <span className="flex items-center gap-8">
            {brandIndicator && (
              <span aria-hidden="true" className="inline-block size-8 bg-brand" />
            )}
            <span className="text-accent-xs normal-case text-foreground-muted">
              {displayFilename}
            </span>
          </span>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy to clipboard"
              className={`text-accent-xs flex items-center gap-6 px-8 py-4 max-lg:min-h-32 max-lg:px-12 transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) ${
                isCopied
                  ? 'bg-brand text-[#141314]'
                  : 'bg-foreground text-background hover:opacity-90'
              }`}
            >
              {isCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isCopied ? 'Copied.' : 'Copy'}</span>
            </button>
          )}
        </div>
      )}
      <div
        ref={editorContainerRef}
        className="min-h-0 flex-1 overflow-auto"
        style={{ maxHeight, fontSize }}
      />
    </div>
  );
}

