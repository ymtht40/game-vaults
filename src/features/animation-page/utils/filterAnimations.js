function text(value) {
  return typeof value === 'string' ? value : '';
}

function count(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function timestamp(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

export function getInteractions(animation) {
  const value = animation.metadata?.interaction;
  return Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
}

export function filterAnimations(animations, {
  categories = [],
  interaction = null,
  freeOnly = false,
  search = '',
  sort = 'recent',
} = {}, categoryOptions = [], now = Date.now()) {
  const query = text(search).toLowerCase().trim();
  const labels = new Map(categoryOptions.map(({ value, label }) => [value, label]));
  const publishedTime = (animation) =>
    timestamp(animation.published_at) || timestamp(animation.created_at);
  const newestFirst = (a, b) =>
    publishedTime(b) - publishedTime(a) ||
    text(a.id).localeCompare(text(b.id));

  const filtered = animations.filter((animation) => {
    if (categories.length && !categories.includes(animation.category)) return false;
    if (interaction && !getInteractions(animation).includes(interaction)) return false;
    if (freeOnly && !animation.is_free_preview) return false;
    return !query || [
      animation.title,
      animation.description,
      animation.category,
      labels.get(animation.category),
    ].some((value) => text(value).toLowerCase().includes(query));
  });

  switch (sort) {
    case 'hot':
      return filtered.sort((a, b) =>
        count(b.view_count) - count(a.view_count) || newestFirst(a, b));
    case 'saved':
      return filtered.sort((a, b) =>
        count(b.save_count) - count(a.save_count) || newestFirst(a, b));
    case 'new':
      return filtered.sort(newestFirst);
    default: {
      const isRecent = (animation) =>
        timestamp(animation.published_at) > now - 1209600000 ||
        timestamp(animation.content_updated_at) > now - 604800000;
      return filtered.sort((a, b) =>
        Number(isRecent(b)) - Number(isRecent(a)) || newestFirst(a, b));
    }
  }
}
