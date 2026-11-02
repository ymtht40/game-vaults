
const accounts = [
  {
    id: 'MLBB-001',
    slug: 'mlbb-001',
    title: 'MLBB Mythical Glory | 120 Skins',
    game: 'Mobile Legends: Bang Bang',
    rank: 'Mythical Glory',
    skins: 120,
    price: 350000,
    status: 'available',
    image: '/images/mlbb-001.jpg',
    description:
      'MLBB Mythical Glory Account, 120 Skins ပါဝင်ပြီး 350,000 MMK ဖြင့် ရောင်းချထားသည်။',
    updatedAt: '2026-11-02T08:00:00Z',
  },
  {
    id: 'MLBB-002',
    slug: 'mlbb-002',
    title: 'MLBB Collector Account | 200 Skins',
    game: 'Mobile Legends: Bang Bang',
    rank: 'Mythic',
    skins: 200,
    price: 700000,
    status: 'sold',
    image: '/images/mlbb-002.jpg',
    description:
      'MLBB Collector Account, 200 Skins ပါဝင်ပြီး 700,000 MMK တန်ဖိုးရှိသည်။',
    updatedAt: '2026-11-01T08:00:00Z',
  },
];

export async function getGameAccountBySlug(slug) {
  return (
    accounts.find((account) => account.slug === slug) ??
    null
  );
}

export async function getAvailableGameAccounts() {
  return accounts.filter(
    (account) => account.status === 'available'
  );
}
