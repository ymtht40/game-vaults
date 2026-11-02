import LenisProvider from '@/contexts/LenisProvider';
import { AnimationProvider } from '@/contexts/AnimationProvider';
import { ScrollLockProvider } from '@/contexts/ScrollLockProvider';
import { CookieConsentProvider } from '@/contexts/CookieConsentProvider';
import { ConsentAwareAnalytics } from '@/features/common/ConsentAwareAnalytics';
import TransitionLayout from '@/components/layout/TransitionLayout';
import { UserProvider } from '@/contexts/UserProvider';
import { NotificationProvider } from '@/contexts/NotificationProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { CategoryProvider } from '@/contexts/CategoryProvider';
import GlobalProviders from '@/contexts/GlobalProviders';
import { ListSizeProvider } from '@/contexts/ListSizeProvider';
import PageReadyTrigger from '@/features/common/PageReadyTrigger';

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
                  <GlobalProviders>
                  <ListSizeProvider>
                    {children}
                    </ListSizeProvider>
                    </GlobalProviders>
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
