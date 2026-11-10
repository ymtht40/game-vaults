import LenisProvider from '@/providers/LenisProvider';
import { AnimationProvider } from '@/providers/AnimationProvider';
import { ScrollLockProvider } from '@/providers/ScrollLockProvider';
import { CookieConsentProvider } from '@/providers/CookieConsentProvider';
import { ConsentAwareAnalytics } from '@/features/legal/ConsentAwareAnalytics';
import TransitionLayout from '@/components/layout/TransitionLayout';
import { UserProvider } from '@/providers/UserProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { CategoryProvider } from '@/providers/CategoryProvider';
import AppProviders from '@/providers/AppProviders';
import { ListSizeProvider } from '@/providers/ListSizeProvider';
import PageReadyTrigger from '@/components/layout/PageReadyTrigger';

const EMPTY_FEED = { banner: null, items: [], latestDate: null };

export default function Provider({
  children,
  categories = [],
  notifications = EMPTY_FEED,
}) {
  return (
    <LenisProvider>
      <AnimationProvider>
        <TransitionLayout>
          <ScrollLockProvider>
            <UserProvider>
              <NotificationProvider value={notifications}>
                <ThemeProvider>
                  <CategoryProvider value={categories}>
                  <AppProviders>
                  <ListSizeProvider>
                    {children}
                    </ListSizeProvider>
                    </AppProviders>
                  </CategoryProvider>
                </ThemeProvider>
              </NotificationProvider>
            </UserProvider>
            <CookieConsentProvider />
          </ScrollLockProvider>
        </TransitionLayout>
        <ConsentAwareAnalytics />
        <PageReadyTrigger />
      </AnimationProvider>
    </LenisProvider>
  );
}
