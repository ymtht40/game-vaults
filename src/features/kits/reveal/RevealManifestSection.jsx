'use client';

// Variable Mapping: k -> RevealManifestSection?, e -> kit, a -> videos, n -> manifestItems, s -> metadata, o -> formats, c -> components, d -> hoverPreviewItems, u -> coverItems, m -> heroItems, g -> listContainerRef, p -> descriptionText, x -> summarySpecs

import { useRef } from 'react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import SplitTextReveal from '@/features/demos/SplitTextReveal'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { MediaHoverReveal } from '@/components/motion/MediaHoverReveal'; // NOTE: module id: 934783 // UNRESOLVED: name guessed from usage
import { getVariantKindMeta, KIT_FORMATS_NOTE } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426 // UNRESOLVED: name guessed from usage
import { ManifestCategoryColumn } from '@/features/kits/reveal/ManifestCategoryColumn'; // NOTE: module id: 301900

// NOTE: module id: 301900
export function RevealManifestSection({ kit, videos = [] }) {
  const metadata = kit?.metadata || {};
  const formats = metadata.formats || [];
  const components = kit?.components || [];
  const manifestItems =
    components.length > 0
      ? components.map((item, index) => ({
          index,
          key: item.slug,
          label: item.title,
          category: getVariantKindMeta(item.variant_kind)?.id || 'hero',
          previewType: item.preview_video_url ? 'video' : 'image',
          previewSrc:
            item.preview_video_url ||
            item.preview_image_url ||
            '/imgs/kits_coming_soon.jpg',
        }))
      : (metadata.variant_kinds || []).map((kind, index) => ({
          index,
          key: kind.key,
          label: kind.label,
          category: kind.key?.includes('cover') ? 'cover' : 'hero',
          previewType: 'video',
          previewSrc: videos[index],
        }));

  const hoverPreviewItems = manifestItems.map((item) => ({
    type: item.previewType,
    src: item.previewSrc,
  }));

  const coverItems = manifestItems.filter((item) => item.category === 'cover');
  const heroItems = manifestItems.filter((item) => item.category === 'hero');
  const listContainerRef = useRef(null);

  const descriptionText =
    components.length > 0
      ? `All ${components.length} components: preloaders and hero sections, every one built to drop in and tune. Hover any to preview it.`
      : 'A complete entrance system: preloaders and hero sections, every one built to drop in and tune. Hover any to preview it.';

  const summarySpecs = [
    {
      label: 'Formats',
      value: `${formats.join(' · ') || 'React · Vue · HTML'}. ${KIT_FORMATS_NOTE}`,
    },
    {
      label: 'One attribute API',
      value:
        'Set timing, easing, and intensity once. The whole system stays in sync.',
    },
    {
      label: 'Production-ready',
      value:
        'Typed, SSR-safe, reduced-motion aware, with a performance budget per component.',
    },
    {
      label: 'Yours forever',
      value:
        'One purchase. Every future update to this Kit, at no extra cost.',
    },
  ];

  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">
              What's inside
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[24ch] font-medium"
            >
              Everything you get.
            </RevealHeading>
            <SplitTextReveal
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[58ch] leading-relaxed text-foreground-muted"
            >
              {descriptionText}
            </SplitTextReveal>
            <div
              ref={listContainerRef}
              className="mt-40 grid grid-cols-12 gap-x-24 gap-y-32"
            >
              <ManifestCategoryColumn
                eyebrow={`Preloaders${coverItems.length ? ` (${coverItems.length})` : ''}`}
                items={coverItems}
                className="col-span-12 lg:col-span-6"
              />
              <ManifestCategoryColumn
                eyebrow={`Hero sections${heroItems.length ? ` (${heroItems.length})` : ''}`}
                items={heroItems}
                className="col-span-12 lg:col-span-6"
              />
            </div>
            <div className="mt-40 grid grid-cols-1 gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
              {summarySpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-8 bg-background px-20 py-24"
                >
                  <span className="flex items-center gap-8 text-mono-sm text-foreground">
                    <span
                      aria-hidden="true"
                      className="size-6 shrink-0 bg-brand"
                    />
                    {spec.label}
                  </span>
                  <span className="text-body-sm leading-relaxed text-foreground-muted">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MediaHoverReveal
        containerRef={listContainerRef}
        items={hoverPreviewItems}
        width={240}
        frameClassName="border border-foreground/15"
      />
    </section>
  );
}
