'use client';

import { useCallback, useMemo, useRef } from 'react';
import _JSXStyle from 'styled-jsx/style';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useGSAP } from '@gsap/react';
import RevealHeading from '@/components/motion/RevealHeading';
import  CocaColaLogo  from '@/assets/logos/CocaColaLogo';
import  BodyArmorLogo  from '@/assets/logos/BodyArmorLogo';
import WkndhrsLogo  from '@/assets/logos/WkndhrsLogo';
import  PoweradeLogo  from '@/assets/logos/PoweradeLogo';

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

const LOGO_BASE_HEIGHTS = {
  coca: 48,
  bodyArmor: 32,
  wkndhrs: 24,
  powerade: 56,
};

const SIZE_SCALES = {
  sm: 0.5,
  md: 0.75,
  lg: 1,
};

const SECTION_PADDING_CLASSES = {
  sm: 'py-8 lg:py-16',
  md: 'py-16 lg:py-24',
  lg: 'py-24 lg:py-32',
};

const BRAND_MARQUEE_WRAP_CLASS =
  'brand-logo-marquee-wrap relative w-screen ml-[calc(50%-50vw)] bg-background';

function createHorizontalLoop(items, config) {
  let totalWidth;
  let startX;
  let distanceToStart;
  let distanceToLoop;
  let item;

  items = gsap.utils.toArray(items);
  config = config || {};

  const tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + 100 * tl.duration()),
  });

  const length = items.length;
  const startOffset = items[0].offsetLeft;
  const times = [];
  const widths = [];
  const xPercents = [];
  let curIndex = 0;
  const pixelsPerSecond = 100 * (config.speed || 1);
  const snap = config.snap === false ? (val) => val : gsap.utils.snap(config.snap || 1);

  const populateWidths = () => {
    items.forEach((el, index) => {
      widths[index] = parseFloat(gsap.getProperty(el, 'width', 'px'));
      xPercents[index] = snap(
        (parseFloat(gsap.getProperty(el, 'x', 'px')) / widths[index]) * 100 +
          gsap.getProperty(el, 'xPercent'),
      );
    });
  };

  const getTotalWidth = () =>
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startOffset +
    items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], 'scaleX') +
    (parseFloat(config.paddingRight) || 0);

  populateWidths();
  gsap.set(items, { xPercent: (index) => xPercents[index] });
  gsap.set(items, { x: 0 });
  totalWidth = getTotalWidth();

  for (let i = 0; i < length; i++) {
    item = items[i];
    startX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + startX - startOffset;
    distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');

    tl.to(
      item,
      {
        xPercent: snap(((startX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0,
    )
      .fromTo(
        item,
        {
          xPercent: snap(((startX - distanceToLoop + totalWidth) / widths[i]) * 100),
        },
        {
          xPercent: xPercents[i],
          duration: (startX - distanceToLoop + totalWidth - startX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond,
      )
      .add('label' + i, distanceToStart / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index, vars) {
    vars = vars || {};
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length;
    }

    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }

    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.updateIndex = () => (curIndex = Math.round(tl.progress() * items.length));
  tl.times = times;
  tl.progress(1, true).progress(0, true);

  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }

  if (!config.draggable || typeof Draggable === 'undefined') return tl;

  let ratio;
  let startProgress;
  let draggable;
  let dragSnap;
  let roundFactor;
  const proxy = document.createElement('div');
  const wrap = gsap.utils.wrap(0, 1);
  const align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
  const syncIndex = () => tl.updateIndex();

  draggable = Draggable.create(proxy, {
    trigger: config.trigger || items[0].parentNode,
    type: 'x',
    onPress() {
      tl.pause();
      startProgress = tl.progress();
      tl.progress(0);
      populateWidths();
      totalWidth = getTotalWidth();
      ratio = 1 / totalWidth;
      dragSnap = totalWidth / items.length;
      roundFactor = Math.pow(10, ((dragSnap + '').split('.')[1] || '').length);
      tl.progress(startProgress);
    },
    onDrag: align,
    onThrowUpdate: align,
    inertia: true,
    snap: (value) => {
      const snapped = Math.round(parseFloat(value) / dragSnap) * dragSnap * roundFactor;
      return (snapped - (snapped % 1)) / roundFactor;
    },
    onRelease: syncIndex,
    onThrowComplete: () => {
      const isMovingLeft = draggable.x < 0;
      gsap.set(proxy, { x: 0 });
      syncIndex();
      tl.timeScale(1);

      if (isMovingLeft) {
        tl.play();
        return;
      }

      tl.reverse();
    },
  })[0];

  tl.draggable = draggable;

  return tl;
}

function buildBrandLogoItems(size = 'lg') {
  const scale = SIZE_SCALES[size] ?? 1;
  const getScaledHeight = (key) => Math.round(LOGO_BASE_HEIGHTS[key] * scale);

  return [
    {
      type: 'text',
      content: (
        <CocaColaLogo
          style={{ height: getScaledHeight('coca') }}
          className="w-auto text-foreground-muted"
        />
      ),
    },
    {
      type: 'text',
      content: (
        <BodyArmorLogo
          style={{ height: getScaledHeight('bodyArmor') }}
          className="w-auto text-foreground-muted"
        />
      ),
    },
    {
      type: 'text',
      content: (
        <WkndhrsLogo
          style={{ height: getScaledHeight('wkndhrs') }}
          className="w-auto text-foreground-muted"
        />
      ),
    },
    {
      type: 'text',
      content: (
        <PoweradeLogo
          style={{ height: getScaledHeight('powerade') }}
          className="w-auto text-foreground-muted"
        />
      ),
    },
  ];
}

function MarqueeItem({ item }) {
  const ariaHidden = item._isClone ? 'true' : undefined;

  if (item.type === 'image') {
    return (
      <img
        className="marquee_item_image"
        src={item.src}
        alt={item.alt || ''}
        aria-hidden={ariaHidden}
      />
    );
  }

  return (
    <span className="marquee_item" aria-hidden={ariaHidden}>
      {item.content}
    </span>
  );
}

function MarqueeTrack({ trackIndex, displayItems }) {
  return (
    <div
      className="marquee_track"
      data-anm-track-index={trackIndex}
      aria-hidden={trackIndex > 0 ? 'true' : undefined}
    >
      <div className="marquee_content" data-anm-content>
        {displayItems.map((item, itemIndex) => (
          <MarqueeItem key={itemIndex} item={item} />
        ))}
      </div>
    </div>
  );
}

function Marquee({
  className = '',
  items = [],
  type = 'horizontal',
  speed = 1,
  direction = 'left',
  draggable = true,
  dragSensitivity = 1,
  pauseOnHover = false,
  paused = false,
  clone = false,
  tracks = 1,
}) {
  const containerRef = useRef(null);
  const timelinesRef = useRef([]);
  const draggablesRef = useRef([]);

  const isVertical = type === 'vertical';
  const trackCount = Math.max(1, parseInt(tracks, 10) || 1);
  const verticalClass = isVertical ? 'is-vertical' : '';
  const dualClass = trackCount > 1 ? 'is-dual' : '';
  const containerClass = `marquee_container ${verticalClass} ${dualClass} ${className}`.trim();

  const trackIndices = useMemo(
    () => Array.from({ length: trackCount }, (_, index) => index),
    [trackCount],
  );

  const displayItems = useMemo(() => {
    if (!clone || !items.length) return items;

    const cloneCount = clone === 'auto' ? 2 : parseInt(clone, 10);
    if (isNaN(cloneCount) || cloneCount < 1) return items;

    const result = [...items];
    for (let i = 0; i < cloneCount; i++) {
      items.forEach((item) => {
        result.push({ ...item, _isClone: true });
      });
    }
    return result;
  }, [items, clone]);

  const onMouseEnter = useCallback(() => {
    if (!pauseOnHover || !timelinesRef.current.length) return;

    timelinesRef.current.forEach((tl) => tl.pause());
  }, [pauseOnHover]);

  const onMouseLeave = useCallback(() => {
    if (!pauseOnHover || !timelinesRef.current.length) return;

    timelinesRef.current.forEach((tl) => tl.play());
  }, [pauseOnHover]);

  useGSAP(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !containerRef.current ||
      !displayItems.length
    ) {
      return;
    }

    const trackElements = containerRef.current.querySelectorAll('.marquee_track');
    if (!trackElements.length) return;

    const createdTimelines = [];
    const createdDraggables = [];

    trackElements.forEach((trackEl, trackIndex) => {
      const contentEl = trackEl.querySelector('[data-anm-content]');
      if (!contentEl) return;

      const childNodes = gsap.utils.toArray(contentEl.children);
      if (!childNodes.length) return;

      const isReverseDirection = direction === 'right' || direction === 'down';
      const loopTl = createHorizontalLoop(childNodes, {
        paused: true,
        draggable,
        repeat: -1,
        speed,
        reversed: false,
        trigger: trackEl,
      });

      if (!paused) {
        const shouldReverse = trackIndex % 2 !== 0 ? !isReverseDirection : isReverseDirection;
        if (shouldReverse) {
          loopTl.progress(1);
          loopTl.reverse();
        } else {
          loopTl.play();
        }
      }

      createdTimelines.push(loopTl);
      if (loopTl.draggable) {
        createdDraggables.push(loopTl.draggable);
      }
    });

    timelinesRef.current = createdTimelines;
    draggablesRef.current = createdDraggables;

    return function cleanup() {
      timelinesRef.current.forEach((tl) => tl.kill());
      timelinesRef.current = [];
      draggablesRef.current.forEach((drag) => drag.kill());
      draggablesRef.current = [];
    };
  }, {
    scope: containerRef,
    dependencies: [
      displayItems,
      type,
      speed,
      direction,
      draggable,
      dragSensitivity,
      paused,
      trackCount,
    ],
  });

  return (
    <div
      ref={containerRef}
      className={containerClass}
      data-anm-marquee
      data-anm-type={type}
      data-anm-speed={speed}
      data-anm-direction={direction}
      data-anm-draggable={draggable}
      data-anm-drag-sensitivity={dragSensitivity}
      data-anm-pause-on-hover={pauseOnHover}
      data-anm-clone={clone || undefined}
      data-anm-tracks={trackCount > 1 ? trackCount : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {trackIndices.map((trackIndex) => (
        <MarqueeTrack key={trackIndex} trackIndex={trackIndex} displayItems={displayItems} />
      ))}
    </div>
  );
}

function BrandLogoMarquee({ className = '', theme = 'dark', size = 'lg' }) {
  const items = buildBrandLogoItems(size);
  const paddingClass = SECTION_PADDING_CLASSES[size] || SECTION_PADDING_CLASSES.lg;
  const wrapClass = `${BRAND_MARQUEE_WRAP_CLASS} ${paddingClass} ${className}`.trim();

  return (
    <section data-theme={theme} className={'jsx-555403792896adfb ' + (wrapClass || '')}>
      <_JSXStyle id="555403792896adfb">
        {'.brand-logo-marquee-wrap.jsx-555403792896adfb .marquee_container{transform:none!important}'}
      </_JSXStyle>
      <Marquee
        items={items}
        type="horizontal"
        direction="left"
        speed={0.5}
        clone={6}
        draggable
        pauseOnHover={false}
      />
    </section>
  );
}

export function BrandLogoSection({
  headline = 'Built by the studio who ships for',
  theme = 'light',
  size = 'sm',
}) {
  return (
    <section data-theme={theme} className="bg-background text-foreground">
      <div className="v2-container pt-40 lg:pt-56">
        <RevealHeading
          as="h2"
          sizeClass="text-h4"
          trigger="scroll"
          className="mx-auto max-w-[28ch] text-center font-medium"
        >
          {headline}
        </RevealHeading>
      </div>
      <BrandLogoMarquee theme={theme} size={size} />
    </section>
  );
}

export default BrandLogoSection;