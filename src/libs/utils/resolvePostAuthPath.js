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
  const userId = session.user.id;
  const email = session.user.email;

  const { data: user } = await supabase
    .from('users')
    .select('id, onboarding_completed, has_access, preferred_platform')
    .eq('id', userId)
    .single();

  if (!user) {
    await supabase.from('users').insert(
      createUserRecord({
        id: userId,
        email,
      }),
    );
  }

  return user &&
    (user.onboarding_completed !== false || user.preferred_platform)
    ? '/animations'
    : '/welcome';
}

