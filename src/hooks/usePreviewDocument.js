
'use client';

import { useEffect, useMemo, useState } from 'react';

import { buildPreviewDocument } from '@/features/animation-detil/utils/templateBuilder';
import { inlinePreviewAssets } from '@/features/animation-detil/utils/inlinePreviewAssets';

const SUPPORTED_TEMPLATES = new Set([
  'instant',
  'compact',
  'scroll-text',
  'scroll-cover',
  'menu',
  'shader',
  'shader-scroll',
  'full-page',
]);

function selectTemplate({
  metadata,
  category,
  animationName = '',
  compact = false,
} = {}) {
  const specifiedTemplate =
    metadata?.previewTemplate || metadata?.sandbox_template;

  if (
    specifiedTemplate &&
    SUPPORTED_TEMPLATES.has(specifiedTemplate)
  ) {
    return specifiedTemplate;
  }

  const name = (animationName || '').toLowerCase();

  if (category === 'shader') {
    return name.includes('scroll')
      ? 'shader-scroll'
      : 'shader';
  }

  if (category === 'scroll') {
    return name.includes('text')
      ? 'scroll-text'
      : 'scroll-cover';
  }

  if (name.includes('menu') || metadata?.type === 'menu') {
    return 'menu';
  }

  return compact ? 'compact' : 'instant';
}

const FALLBACK_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Animation Preview</title>
  <style>
    body { background:#0a0a0a; color:#fafafa; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; padding:3rem; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    {{ANIMATION_CSS}}
  </style>
</head>
<body>
  {{ANIMATION_HTML}}
  {{ANIMATION_SCRIPTS}}
</body>
</html>`;

export function usePreviewDocument({
  enabled = true,
  animationName = 'Animation Preview',
  animationDescription = '',
  category = 'instant',
  layout,
  htmlCode = '',
  cssCode = '',
  jsCode = '',
  dependencies = [],
  compact = false,
  metadata = null,
}) {
  const [templateHtml, setTemplateHtml] = useState('');
  const [processedHtmlCode, setProcessedHtmlCode] = useState('');
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [isHtmlLoading, setIsHtmlLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setTemplateHtml('');
      setIsTemplateLoading(false);
      return;
    }
    let cancelled = false;
    setIsTemplateLoading(true);

    async function loadTemplate() {
      try {
        let templateName = selectTemplate({
          metadata,
          category,
          animationName,
          compact,
        });

        if (
          !metadata?.previewTemplate &&
          !metadata?.sandbox_template &&
          layout === 'full-viewport' &&
          (templateName === 'instant' ||
            templateName === 'compact')
        ) {
          templateName = 'menu';
        }

        const response = await fetch(
          `/animations/templates/${templateName}.html`,
        );

        if (!response.ok) throw new Error('Preview template unavailable');
        const html = await response.text();
        if (!html.includes('{{ANIMATION_HTML}}')) {
          throw new Error('Invalid preview template');
        }

        if (!cancelled) {
          setTemplateHtml(html);
        }
      } catch {
        console.warn('Preview template unavailable; using the existing fallback.');

        if (!cancelled) {
          setTemplateHtml(FALLBACK_TEMPLATE);
        }
      } finally {
        if (!cancelled) {
          setIsTemplateLoading(false);
        }
      }
    }

    loadTemplate();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    category,
    animationName,
    compact,
    layout,
    metadata?.previewTemplate,
    metadata?.sandbox_template,
    metadata?.type,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function prepareHtml() {
      setIsHtmlLoading(true);

      try {
        const html = await inlinePreviewAssets(htmlCode);
        if (!cancelled) setProcessedHtmlCode(html);
      } catch {
        if (!cancelled) setProcessedHtmlCode(htmlCode);
      } finally {
        if (!cancelled) setIsHtmlLoading(false);
      }
    }

    if (enabled && htmlCode) {
      prepareHtml();
    } else {
      setProcessedHtmlCode('');
      setIsHtmlLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [enabled, htmlCode]);

  const srcdoc = useMemo(
    () =>
      templateHtml
        ? buildPreviewDocument({
            templateHtml,
            processedHtmlCode,
            cssCode,
            jsCode,
            dependencies,
            animationName,
            animationDescription,
            category,
            metadata,
          })
        : '',
    [
      templateHtml,
      processedHtmlCode,
      cssCode,
      jsCode,
      animationName,
      animationDescription,
      dependencies,
      category,
      metadata,
    ],
  );

  return {
    srcdoc,
    isLoading: isTemplateLoading || isHtmlLoading,
  };
}

