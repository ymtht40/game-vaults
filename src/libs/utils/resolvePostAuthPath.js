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

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!error && !user) {
      const { error: insertError } = await supabase.from('users').insert(
        createUserRecord({
          id: userId,
          email,
        }),
      );

      if (insertError && insertError.code !== '23505') {
        console.warn('Unable to initialize the user profile.');
      }
    } else if (error) {
      console.warn('Unable to load the user profile after sign-in.');
    }
  } catch {
    // Profile failures must not discard a successfully verified OTP session.
    console.warn('Unable to initialize the user profile.');
  }

  // Onboarding is available in the app; there is no standalone /welcome route.
  return '/animations';
}
