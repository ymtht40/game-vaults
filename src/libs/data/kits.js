// Static data for the /kits page, extracted from the production /kits snapshot.
// Hero order is Reveal, Menu. The "Inside" tabs show Menu first (see KitsClient).

const CDN = 'https://annnimate.b-cdn.net/video-thumbnails/kits';

export const KIT_PRICE = '€149';

const revealComponents = [
    { slug: 'logo-draw-split', title: 'Logo Draw Split', preview_image_url: `${CDN}/reveal/logo-draw-split/logo-draw-split_cover.avif`, preview_video_url: `${CDN}/reveal/logo-draw-split/logo-draw-split.mp4` },
    { slug: 'composing-grid', title: 'Composing Grid', preview_image_url: `${CDN}/reveal/composing-grid/composing-grid_cover.avif`, preview_video_url: `${CDN}/reveal/composing-grid/composing-grid.mp4` },
    { slug: 'counter-columns', title: 'Counter Columns', preview_image_url: `${CDN}/reveal/counter-columns/counter-columns_cover.avif`, preview_video_url: `${CDN}/reveal/counter-columns/counter-columns.mp4` },
    { slug: 'mosaic-dissolve', title: 'Mosaic Dissolve', preview_image_url: `${CDN}/reveal/mosaic-dissolve/mosaic-dissolve_cover.avif`, preview_video_url: `${CDN}/reveal/mosaic-dissolve/mosaic-dissolve.mp4` },
    { slug: 'flow-field', title: 'Flow Field', preview_image_url: `${CDN}/reveal/flow-field/flow-field_cover.avif`, preview_video_url: `${CDN}/reveal/flow-field/flow-field.mp4` },
    { slug: 'hero-marquee', title: 'Hero Marquee', preview_image_url: `${CDN}/reveal/hero-marquee/hero-marquee_cover.avif`, preview_video_url: `${CDN}/reveal/hero-marquee/hero-marquee.mp4` },
    { slug: 'fractal-glass-hero', title: 'Fractal Glass Hero', preview_image_url: `${CDN}/reveal/fractal-glass-hero/fractal-glass-hero_cover.avif`, preview_video_url: `${CDN}/reveal/fractal-glass-hero/fractal-glass-hero.mp4` },
    { slug: 'tile-orb', title: 'Tile Orb', preview_image_url: `${CDN}/reveal/tile-orb/tile-orb_cover.avif`, preview_video_url: `${CDN}/reveal/tile-orb/tile-orb.mp4` },
    { slug: 'logo-fill-cover', title: 'Logo Fill Cover', preview_image_url: `${CDN}/reveal/logo-fill-cover/logo-fill-cover_cover.avif`, preview_video_url: `${CDN}/reveal/logo-fill-cover/logo-fill-cover.mp4` },
    { slug: 'image-cycle-zoom', title: 'Image Cycle Zoom', preview_image_url: `${CDN}/reveal/image-cycle-zoom/image-cycle-zoom_cover.avif`, preview_video_url: `${CDN}/reveal/image-cycle-zoom/image-cycle-zoom.mp4` },
    { slug: 'image-trail-loader', title: 'Image Trail Loader', preview_image_url: `${CDN}/reveal/image-trail-loader/image-trail-loader_cover.avif`, preview_video_url: `${CDN}/reveal/image-trail-loader/image-trail-loader.mp4` },
    { slug: 'grid-flash-cover', title: 'Grid Flash Cover', preview_image_url: `${CDN}/reveal/grid-flash-cover/grid-flash-cover_cover.avif`, preview_video_url: `${CDN}/reveal/grid-flash-cover/grid-flash-cover.mp4` },
    { slug: 'depth-parallax-hero', title: 'Depth Parallax Hero', preview_image_url: `${CDN}/reveal/depth-parallax-hero/depth-parallax-hero_cover.avif`, preview_video_url: `${CDN}/reveal/depth-parallax-hero/depth-parallax-hero.mp4` },
];

const menuComponents = [
    { slug: 'stacked-drawer', title: 'Stacked Drawer', preview_image_url: `${CDN}/menu/stacked-drawer/stacked-drawer_cover.avif`, preview_video_url: `${CDN}/menu/stacked-drawer/stacked-drawer.mp4` },
    { slug: 'preview-index', title: 'Preview Index', preview_image_url: `${CDN}/menu/preview-index/preview-index_cover.avif`, preview_video_url: `${CDN}/menu/preview-index/preview-index.mp4` },
    { slug: 'curtain', title: 'Curtain', preview_image_url: `${CDN}/menu/curtain/curtain_cover.avif`, preview_video_url: `${CDN}/menu/curtain/curtain.mp4` },
    { slug: 'tile-grid', title: 'Tile Grid', preview_image_url: `${CDN}/menu/tile-grid/tile-grid_cover.avif`, preview_video_url: `${CDN}/menu/tile-grid/tile-grid.mp4` },
    { slug: 'accordion', title: 'Accordion', preview_image_url: `${CDN}/menu/accordion/accordion_cover.avif`, preview_video_url: `${CDN}/menu/accordion/accordion.mp4` },
    { slug: 'split-screen', title: 'Split Screen', preview_image_url: `${CDN}/menu/split-screen/split-screen_cover.avif`, preview_video_url: `${CDN}/menu/split-screen/split-screen.mp4` },
    { slug: 'context-shift', title: 'Context Shift', preview_image_url: `${CDN}/menu/context-shift/context-shift_cover.avif`, preview_video_url: `${CDN}/menu/context-shift/context-shift.mp4` },
    { slug: 'pillar', title: 'Pillar', preview_image_url: `${CDN}/menu/pillar/pillar_cover.avif`, preview_video_url: `${CDN}/menu/pillar/pillar.mp4` },
    { slug: 'island', title: 'Island', preview_image_url: `${CDN}/menu/island/island_cover.avif`, preview_video_url: `${CDN}/menu/island/island.mp4` },
    { slug: 'push-down', title: 'Push-Down', preview_image_url: `${CDN}/menu/push-down/push-down_cover.avif`, preview_video_url: `${CDN}/menu/push-down/push-down.mp4` },
];

export const KITS = [
  {
    slug: 'reveal',
    title: 'Reveal',
    tagline: 'Preloaders and hero sections, built as one system.',
    price: KIT_PRICE,
    priceDisplay: KIT_PRICE,
    gif: `${CDN}/reveal/reveal-kit-thumbnail.gif`,
    background: `${CDN}/reveal/depth-parallax-hero/depth-parallax-hero_cover.avif`,
    components: revealComponents,
    count: revealComponents.length,
  },
  {
    slug: 'menu',
    title: 'Menu',
    tagline: 'Site navigation, built as one system.',
    price: KIT_PRICE,
    priceDisplay: KIT_PRICE,
    video: `${CDN}/menu/menu-showreel.mp4`,
    gif: `${CDN}/menu/menu-thumbnail.gif`,
    background: `${CDN}/menu/split-screen/split-screen_cover.avif`,
    components: menuComponents,
    count: menuComponents.length,
  },
];

// End CTA ring images: Menu covers first, then Reveal covers (23 total).
export const KIT_RING_IMAGES = [...menuComponents, ...revealComponents].map(
  (component) => component.preview_image_url,
);
