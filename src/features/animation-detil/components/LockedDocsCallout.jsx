// Variable Mapping: ed -> LockedDocsCallout, e -> isAuthenticated, s -> soloPlan, n -> monthlyPrice, c.U -> appConfig, c.K -> getActivePrice, a.f -> LockIcon, r.default -> Button

import { appConfig, getActivePrice } from '@/libs/config/appConfig'; // NOTE: module id: 516799
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { LockIcon } from '@phosphor-icons/react'; // NOTE: module id: 499141

// NOTE: module id: 521041
export default function LockedDocsCallout({ isAuthenticated }) {
  const soloPlan = appConfig.stripe?.landingPlans?.find(
    (plan) => plan.key === 'solo'
  );
  const monthlyPrice = getActivePrice(soloPlan?.quarterly);

  return (
    <section className="border-t border-foreground/10 pt-32">
      <div className="flex flex-col items-start gap-12 bg-foreground/[0.04] p-20">
        <span className="flex size-32 items-center justify-center bg-foreground/10">
          <LockIcon size={14} className="text-foreground" />
        </span>
        <div className="flex flex-col gap-8">
          <p className="text-body font-medium text-foreground">
            Attributes, tips, use cases and full code are part of access.
          </p>
          <p className="text-body-sm text-foreground-reading">
            The preview and provenance stay public. Tune-it docs, the data-anm-*
            attribute table, real-world use cases and the copy-ready code unlock the
            moment you sign in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-24 gap-y-12">
          <Button href="/pricing" theme="light" size="sm">
            Get access
          </Button>
          <span className="text-accent-xs text-foreground-muted">
            {monthlyPrice ? `From €${monthlyPrice}/mo` : 'From €29/mo'}
          </span>
        </div>
      </div>
    </section>
  );
}
