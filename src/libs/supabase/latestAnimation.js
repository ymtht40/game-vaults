import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

const FIELDS =
  'id, title, slug, category, description, view_count, save_count, preview_image_url, preview_video_url, published_at, created_at, content_updated_at, is_free_preview, metadata';

const DETAIL_FIELDS = `${FIELDS}, dependencies, html_code, css_code, js_code, gsap_code, code_react, code_vue, code_html`;

const CATEGORY_LABELS = {
  button: 'Buttons',
  scroll: 'Scroll',
  'ui-component': 'UI Components',
  experimental: 'Experimental',
  shader: 'Shaders',
  menu: 'Menus',
  section: 'Sections',
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('supabase: missing env vars');
    return null;
  }
  return createClient(url, key);
}

function normalizeSummary(animation) {
  const safeCount = (value) => {
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? count : 0;
  };
  return {
    ...animation,
    description: typeof animation.description === 'string' ? animation.description : '',
    view_count: safeCount(animation.view_count),
    save_count: safeCount(animation.save_count),
  };
}

// Share one query between the layout, library, and other summary consumers.
const loadPublishedAnimations = cache(async () => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return { animations: [], failed: true };

    const { data, error } = await supabase
      .from('animations')
      .select(FIELDS)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return { animations: (data ?? []).map(normalizeSummary), failed: false };
  } catch {
    console.error('Unable to load published animations.');
    return { animations: [], failed: true };
  }
});

export const getPublishedAnimations = cache(async ({ throwOnError = false } = {}) => {
  const result = await loadPublishedAnimations();
  if (throwOnError && result.failed) {
    throw Error('Unable to load animations. Please try again.');
  }
  return result.animations;
});

export const getLatestAnimation = cache(async () => {
  const list = await getPublishedAnimations();
  return list[0] ?? null;
});

export const getCategories = cache(async () => {
  const list = await getPublishedAnimations();
  const seen = new Set(list.map((a) => a.category).filter(Boolean));
  return Object.keys(CATEGORY_LABELS)
    .filter((slug) => seen.has(slug))
    .map((slug) => ({ slug, name: CATEGORY_LABELS[slug] }));
});

export const getShippedRecently = cache(async () => {
  const list = await getPublishedAnimations();
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return list.filter((a) => new Date(a.published_at).getTime() >= since).length;
});

export const getAnimationBySlug = cache(async (slug) => {
  const supabase = getSupabaseClient();
  if (!supabase || !slug) return null;

  const { data, error } = await supabase
    .from('animations')
    .select(DETAIL_FIELDS)
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .maybeSingle();

  if (error) {
    console.error('Unable to load the animation.');
    return null;
  }
  return data ? normalizeSummary(data) : null;
});
