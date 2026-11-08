function createUserRecord({ id, email, now = new Date() }) {
  return {
    id,
    email,
    name: email.split('@')[0],
    avatar_index: Math.floor(4 * Math.random()),
    has_access: false,
    subscription_status: 'free',
    onboarding_completed: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export async function resolvePostAuthPath({ supabase, session }) {
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId || typeof email !== 'string' || !email) {
    throw Error('A valid email sign-in session is required.');
  }

  let redirectPath = '/welcome';

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, onboarding_completed, has_access, preferred_platform')
      .eq('id', userId)
      .maybeSingle();

    if (!error && !user) {
      await supabase.from('users').insert(
        createUserRecord({
          id: userId,
          email,
        })
      );
    } else if (user && (user.onboarding_completed !== false || user.preferred_platform)) {
      redirectPath = '/animations';
    }
  } catch (err) {
    console.warn('Unable to process user profile.');
  }

  return redirectPath;
}
