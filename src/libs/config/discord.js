export function getDiscordInviteUrl(user) {
  const defaultInviteUrl = 'https://discord.gg/sAPGDmzacw';

  if (!user) return defaultInviteUrl;

  if (user.is_legacy_user) {
    return 'https://discord.gg/FbBvVkuY8j';
  }

  if (user.plan_name?.toLowerCase().includes('team')) {
    return 'https://discord.gg/ynkZTZyyeJ';
  }

  return defaultInviteUrl;
}