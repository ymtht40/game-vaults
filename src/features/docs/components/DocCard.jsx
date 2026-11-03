'use client';

import { getFigureDefinition } from '@/libs/utils/figures';

import DocCardLink from '@/features/docs/components/DocCardLink'; // module id: 613016
import DocFigureCard from '@/features/docs/components/DocFigureCard'; // module id: 613016

export default function DocCard({
  href,
  title,
  line,
  figure,
  image = null,
  logo = null,
}) {
  const figureConfig = getFigureDefinition(figure);

  if (figureConfig) {
    return (
      <DocFigureCard
        href={href}
        title={title}
        line={line}
        fig={figureConfig}
      />
    );
  }

  const media = image ? (
    <div
      aria-hidden="true"
      className="aspect-[16/9] overflow-hidden border-b border-foreground/10"
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        className="block object-cover"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  ) : logo ? (
    <div
      aria-hidden="true"
      className="flex h-[132px] items-center justify-center border-b border-foreground/10 bg-white"
    >
      <img
        src={logo}
        alt=""
        loading="lazy"
        className="max-h-[56px] max-w-[56px] object-contain opacity-60 grayscale transition-[filter,opacity] duration-(--duration-quick) group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
  ) : null;

  return (
    <DocCardLink
      href={href}
      title={title}
      line={line}
      media={media}
    />
  );
}
