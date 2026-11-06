
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowsOutIcon,
  DesktopIcon,
  DeviceTabletIcon,
  LaptopIcon,
  DeviceMobileIcon,
  ArrowClockwiseIcon,
  DownloadIcon,
  XIcon
} from '@phosphor-icons/react';

import PreviewIframe from '@/features/animation-detil/preview/PreviewIframe'; // module id: 113861
import Select from '@/features/common/Select'; // module id: 977805

import { usePreviewDocument } from '@/hooks/usePreviewDocument'; // module id: 113861

import { analytics } from '@/libs/analytics/posthogAnalytics';

const viewportPresets = [
  { id: 'full', label: 'Full', w: null, Icon: ArrowsOutIcon },
  { id: 'mobile', label: 'Mobile', w: 375, Icon: DeviceMobileIcon },
  { id: 'tablet', label: 'Tablet', w: 768, Icon: DeviceTabletIcon },
  { id: 'laptop', label: 'Laptop', w: 1024, Icon: LaptopIcon },
  { id: 'desktop', label: 'Desktop', w: 1440, Icon: DesktopIcon },
];

const defaultViewportWidth =
  viewportPresets.find((preset) => preset.id === 'desktop')?.w ?? null;

function normalizeDependencies(dependencies) {
  if (!dependencies) return [];
  if (Array.isArray(dependencies)) return dependencies;

  if (typeof dependencies === 'object' && dependencies !== null) {
    const keys = Object.keys(dependencies);
    return keys.length > 0 ? keys : [];
  }

  if (typeof dependencies === 'string') {
    try {
      const parsed = JSON.parse(dependencies);

      if (Array.isArray(parsed)) return parsed;

      if (typeof parsed === 'object' && parsed !== null) {
        const keys = Object.keys(parsed);
        return keys.length > 0 ? keys : [];
      }
    } catch {
      return dependencies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function AnimationPreview({
  animation,
  codeState,
  previewSrcOverride = null,
  customize = null,
  bare = false,
  fill = false,
}) {
  const [viewportWidth, setViewportWidth] = useState(
    defaultViewportWidth,
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const measure = () => {
      setContainerWidth(container.clientWidth);
      setContainerHeight(container.clientHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const htmlCode = codeState?.html ?? animation.html_code ?? '';
  const cssCode = codeState?.css ?? animation.css_code ?? '';
  const jsCode =
    codeState?.js ??
    animation.js_code ??
    animation.gsap_code ??
    '';

  const hasInlineCode =
    !previewSrcOverride && Boolean(htmlCode || cssCode || jsCode);

  const committedAttributes = customize?.committed;

  const fallbackPreviewUrl = useMemo(() => {
    const baseUrl = `/api/sandbox/iframe/${encodeURIComponent(
      animation.slug,
    )}`;

    return committedAttributes &&
      Object.keys(committedAttributes).length !== 0
      ? `${baseUrl}?attrs=${encodeURIComponent(
          JSON.stringify(committedAttributes),
        )}`
      : baseUrl;
  }, [animation.slug, committedAttributes]);

  const previewSrc =
    previewSrcOverride ||
    (hasInlineCode ? undefined : fallbackPreviewUrl);

  const { srcdoc, isLoading } = usePreviewDocument({
    animationName: animation.title,
    animationDescription: animation.description,
    category: animation.category,
    layout: animation.layout,
    htmlCode,
    cssCode,
    jsCode,
    dependencies: normalizeDependencies(animation.dependencies),
    metadata: animation.metadata,
  });

  const isInlineLoading = Boolean(hasInlineCode) && isLoading;
  const customizationValues = customize?.values;

  useEffect(() => {
    if (
      hasInlineCode ||
      !customize ||
      !customizationValues ||
      Object.keys(customizationValues).length === 0
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      const iframe = containerRef.current?.querySelector('iframe');

      iframe?.contentWindow?.postMessage(
        {
          type: 'anm:customize',
          selector: customize.selector,
          attrs: customizationValues,
          api: customize.api,
        },
        '*',
      );
    }, 200);

    return () => clearTimeout(timeout);
  }, [customizationValues, hasInlineCode, reloadKey]);

  const handleReplay = useCallback(() => {
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  const handleExitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const videoUrl = animation?.preview_video_url || null;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClip = useCallback(async () => {
    if (!videoUrl || isDownloading) return;

    setIsDownloading(true);

    analytics.track('detail_clip_downloaded', {
      slug: animation.slug,
    });

    try {
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error(String(response.status));
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = `gamevault-${animation.slug}.mp4`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      window.open(videoUrl, '_blank', 'noopener');
    } finally {
      setIsDownloading(false);
    }
  }, [videoUrl, isDownloading, animation?.slug]);

  useEffect(() => {
    if (bare) return;

    function handleKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;

      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        target?.closest?.('.cm-editor')
      ) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        setIsFullscreen((value) => !value);
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        handleReplay();
      } else if (event.key === 'Escape' && isFullscreen) {
        event.preventDefault();
        handleExitFullscreen();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () =>
      document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, handleReplay, handleExitFullscreen, bare]);

  useEffect(() => {
    if (!bare) return;

    function handleMessage(event) {
      if (event?.data?.type !== 'gamevault-shortcut') return;

      const key = event.data.key;

      if (key === 'f') {
        setIsFullscreen((value) => !value);
      } else if (key === 'r') {
        handleReplay();
      } else if (key === 'Escape') {
        setIsFullscreen(false);
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [handleReplay, bare]);

  const actualViewportWidth = viewportWidth ?? (containerWidth || 0);

  const viewportScale =
    actualViewportWidth > containerWidth && containerWidth > 0
      ? containerWidth / actualViewportWidth
      : 1;

  const isScaled = viewportScale < 0.999;
  const scalePercentage = Math.round(100 * viewportScale);

  const stageHeight = fill
    ? containerHeight
    : Math.max(360, Math.round(0.625 * (containerWidth || 0)));

  const selectedViewportId = viewportPresets.find(
    (preset) => (viewportWidth ?? null) === preset.w,
  )?.id;

  if (bare) {
    return (
      <div
        ref={containerRef}
        className={`relative flex w-full justify-center overflow-hidden bg-background ${fill ? 'h-full' : ''}`}
        style={fill ? undefined : { height: stageHeight }}
      >
        {!isInlineLoading && actualViewportWidth && stageHeight ? (
          <PreviewIframe
            srcdoc={hasInlineCode ? srcdoc : undefined}
            src={previewSrc}
            reloadKey={reloadKey}
            title={`${animation.title} preview`}
            renderWidth={actualViewportWidth}
            scale={viewportScale}
            stageHeight={stageHeight}
          />
        ) : null}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-12">
      <div className="bg-foreground/[0.04] p-12">
        <div
          ref={containerRef}
          className="relative flex w-full justify-center overflow-hidden bg-background"
          style={{ height: stageHeight }}
        >
          {isInlineLoading || !actualViewportWidth ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-body-sm text-foreground-muted">
                Loading preview...
              </p>
            </div>
          ) : (
            <PreviewIframe
              srcdoc={hasInlineCode ? srcdoc : undefined}
              src={previewSrc}
              reloadKey={reloadKey}
              title={`${animation.title} preview`}
              renderWidth={actualViewportWidth}
              scale={viewportScale}
              stageHeight={stageHeight}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-12">
        <div className="hidden lg:block">
          <Select
            value={selectedViewportId}
            onChange={(nextId) => {
              const preset = viewportPresets.find(
                (item) => item.id === nextId,
              );
              if (preset) setViewportWidth(preset.w);
            }}
            options={viewportPresets.map((preset) => ({
              value: preset.id,
              label: preset.label,
              icon: preset.Icon,
            }))}
            size="sm"
            labelSize="xs"
            ariaLabel="Viewport size"
          />
        </div>

        <div className="flex items-center gap-8">
          {isScaled && (
            <span
              className="text-accent-2xs flex h-32 items-center bg-foreground/[0.06] px-8 text-foreground-muted"
              title={`Rendering at ${actualViewportWidth}px, scaled to fit ${containerWidth}px container`}
            >
              {scalePercentage}% scale
            </span>
          )}

          {videoUrl && (
            <button
              type="button"
              onClick={handleDownloadClip}
              disabled={isDownloading}
              aria-label="Download clip"
              title="Download a short clip of this component as an mp4"
              className="text-accent-2xs flex h-32 items-center gap-6 bg-foreground/[0.06] px-10 text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/[0.1] hover:text-foreground disabled:opacity-60"
            >
              <DownloadIcon size={14} />
              <span className="hidden lg:inline">
                {isDownloading ? 'Downloading' : 'Download clip'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay"
            className="text-accent-2xs flex h-32 items-center gap-6 bg-foreground px-10 text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90"
            title="Replay (R)"
          >
            <ArrowClockwiseIcon size={14} />
            <span className="hidden lg:inline">Replay</span>
            <kbd className="text-[9px] ml-4 hidden bg-background/15 px-4 py-1 font-mono text-background/80 lg:inline-block">
              R
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Fullscreen"
            className="text-accent-2xs flex h-32 items-center gap-6 border border-foreground/15 px-10 text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/40 hover:text-foreground"
            title="Fullscreen (F)"
          >
            <ArrowsOutIcon size={14} />
            <span className="hidden lg:inline">Fullscreen</span>
            <kbd className="text-[9px] ml-4 hidden border border-foreground/15 px-4 py-1 font-mono text-foreground-muted lg:inline-block">
              F
            </kbd>
          </button>
        </div>
      </div>

      {isFullscreen &&
        isMounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${animation.title} fullscreen preview`}
            className="fixed inset-0 z-[400] bg-background"
          >
            <div className="absolute bottom-16 right-16 z-10 flex items-center gap-8">
              <button
                type="button"
                onClick={handleReplay}
                aria-label="Replay"
                title="Replay (R)"
                className="text-accent-2xs flex h-32 items-center gap-6 border border-white/20 bg-[#0a0a0a]/85 px-10 text-white backdrop-blur-md transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-[#0a0a0a]"
              >
                <ArrowClockwiseIcon size={14} />
                <span>Replay</span>
                <kbd className="text-[9px] ml-4 border border-white/20 px-4 py-1 font-mono text-white/80">
                  R
                </kbd>
              </button>

              <button
                type="button"
                onClick={handleExitFullscreen}
                aria-label="Exit fullscreen"
                title="Close (Esc)"
                className="text-accent-2xs flex h-32 items-center gap-6 border border-white/20 bg-[#0a0a0a]/85 px-10 text-white backdrop-blur-md transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-[#0a0a0a]"
              >
                <XIcon size={14} />
                <span>Close</span>
                <kbd className="text-[9px] ml-4 border border-white/20 px-4 py-1 font-mono text-white/80">
                  Esc
                </kbd>
              </button>
            </div>

            {!isInlineLoading && (
              <iframe
                key={`fs-${reloadKey}`}
                {...(hasInlineCode
                  ? { srcDoc: srcdoc }
                  : { src: previewSrc })}
                title={`${animation.title} fullscreen preview`}
                sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  display: 'block',
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}
