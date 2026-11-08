'use client';

// Variable Mapping: f -> BUTTON_BASE_CLASS, e -> markdown, i -> articleSelector, s -> className, m -> label, x -> aiActions, g -> isCopied, h -> setIsCopied, y -> isMenuOpen, w -> setIsMenuOpen, b -> copyTimeoutRef, v -> containerRef, j -> pathname, V -> handleCopyPage, E -> buttonContent, H -> markdownPath, M -> markdownUrl, O -> encodedPrompt, z -> MENU_ITEM_CLASS

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import {
  ArrowSquareOut,
  CaretDown,
  Check,
  Copy,
  FileMd,
} from '@phosphor-icons/react'; // NOTE: module id: 364203, 815330, 499839, 999723, 656140
import { appConfig } from '@/libs/config/appConfig'; // NOTE: module id: 516799
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

const BUTTON_BASE_CLASS =
  'inline-flex h-32 items-center gap-8 border border-foreground/15 bg-background px-12 text-accent-xs text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-power3-out) hover:border-foreground/30 hover:text-foreground';

// NOTE: module id: 656140
export default function CopyPageButton({
  markdown,
  articleSelector = 'article',
  className,
  label = 'Copy page',
  aiActions = false,
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const copyTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const pathname = usePathname();

  async function handleCopyPage() {
    let textToCopy = markdown;
    if (!textToCopy) {
      const articleElement =
        typeof document !== 'undefined'
          ? document.querySelector(articleSelector)
          : null;
      textToCopy = articleElement ? articleElement.innerText : '';
    }
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setIsMenuOpen(false);
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 1600);
      } catch (err) {
        console.error('[CopyPageButton] clipboard write failed', err);
      }
    }
  }

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const buttonContent = (
    <>
      <span className="grid h-12 w-12 place-items-center">
        {isCopied ? (
          <Check className="size-12 text-brand" />
        ) : (
          <Copy className="size-12" />
        )}
      </span>
      <span>{isCopied ? 'Copied' : label}</span>
    </>
  );

  if (!aiActions) {
    return (
      <button
        type="button"
        onClick={handleCopyPage}
        aria-label={isCopied ? 'Page copied' : label}
        className={cn(BUTTON_BASE_CLASS, className)}
      >
        {buttonContent}
      </button>
    );
  }

  const markdownPath = `${pathname}.md`;
  const markdownUrl = `https://${appConfig.domainName}${markdownPath}`;
  const encodedPrompt = encodeURIComponent(
    `Read ${markdownUrl} and answer my questions about it.`
  );
  const MENU_ITEM_CLASS =
    'flex w-full items-center gap-8 px-12 py-10 text-left text-accent-xs text-foreground transition-colors duration-(--duration-fast) ease-(--ease-power3-out) hover:bg-foreground/10';

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={handleCopyPage}
        aria-label={isCopied ? 'Page copied' : label}
        className={cn(BUTTON_BASE_CLASS, 'border-r-0')}
      >
        {buttonContent}
      </button>
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="More copy options"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className={cn(BUTTON_BASE_CLASS, 'px-8')}
      >
        <CaretDown
          className={cn(
            'size-12 transition-transform duration-(--duration-fast) ease-(--ease-power3-out)',
            isMenuOpen && 'rotate-180'
          )}
        />
      </button>
      {isMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-4 min-w-[220px] border border-foreground/15 bg-background py-4 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyPage}
            className={MENU_ITEM_CLASS}
          >
            <Copy className="size-12 shrink-0 text-foreground-muted" />
            <span>Copy as Markdown</span>
          </button>
          <a
            role="menuitem"
            href={markdownPath}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className={MENU_ITEM_CLASS}
          >
            <FileMd className="size-12 shrink-0 text-foreground-muted" />
            <span>View as Markdown</span>
          </a>
          <span aria-hidden="true" className="my-4 block h-px bg-foreground/10" />
          <a
            role="menuitem"
            href={`https://claude.ai/new?q=${encodedPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className={MENU_ITEM_CLASS}
          >
            <ArrowSquareOut className="size-12 shrink-0 text-foreground-muted" />
            <span>Open in Claude</span>
          </a>
          <a
            role="menuitem"
            href={`https://chatgpt.com/?q=${encodedPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className={MENU_ITEM_CLASS}
          >
            <ArrowSquareOut className="size-12 shrink-0 text-foreground-muted" />
            <span>Open in ChatGPT</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}