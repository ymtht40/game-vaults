import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createServerSupabase(existingCookieStore) {
  const cookieStore = existingCookieStore ?? (await cookies());
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies; middleware refreshes them.
          }
        },
      },
    },
  );
}

export async function getViewerContext() {
  // Keep Next.js request/rendering signals outside the Auth error handler.
  const cookieStore = await cookies();
  const anonymousViewer = { user: null, hasAccess: false, savedIds: [] };
  let supabase;
  let user;

  try {
    supabase = await createServerSupabase(cookieStore);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return anonymousViewer;
    user = data.user;
  } catch {
    console.warn('Unable to verify the current session.');
    return anonymousViewer;
  }

  const [profileResult, savedResult] = await Promise.allSettled([
    supabase.from('users').select('has_access').eq('id', user.id).maybeSingle(),
    supabase
      .from('saved_animations')
      .select('animation_id')
      .eq('user_id', user.id),
  ]);

  const profile =
    profileResult.status === 'fulfilled' && !profileResult.value.error
      ? profileResult.value.data
      : null;
  const saved =
    savedResult.status === 'fulfilled' && !savedResult.value.error
      ? savedResult.value.data
      : [];

  return {
    user,
    hasAccess: profile?.has_access === true,
    savedIds: [
      ...new Set(
        (saved ?? [])
          .map((row) => row.animation_id)
          .filter((id) => typeof id === 'string' && id.length > 0),
      ),
    ],
  };
}
