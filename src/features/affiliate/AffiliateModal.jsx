'use client';

// Variable Mapping: u -> PromoDialog, m -> AffiliateModalMedia, v -> contentRef, A -> getExternalLinkProps

import { useRef } from 'react';
import { X } from '@phosphor-icons/react'; // NOTE: module id: 137410
import { AFFILIATE_URL } from '@/libs/config/affiliate'; // NOTE: module id: 664294
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription
} from '@/features/common/Dialog'; // NOTE: module id: 753145
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import { SecondaryButton } from '@/components/ui/SecondaryButton'; // NOTE: module id: 511757
import DescriptionList from '@/components/ui/SpecList'; // NOTE: module id: 567874
import GroundBackground from '@/components/ui/GroundBackground'; // NOTE: module id: 578275
import { AffiliateEarningsCard } from '@/features/affiliate/AffiliateEarningsCard'; // NOTE: module id: 664466

function PromoDialog({
  open,
  onOpenChange,
  media,
  title,
  children,
  facts,
  primary,
  secondary,
  onAction,
  dismissLabel = 'Not now'
}) {
  const contentRef = useRef(null);
  const getExternalLinkProps = (action) =>
    action?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        data-lenis-prevent={true}
        tabIndex={-1}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        className="!rounded-none focus:outline-none !border-foreground/15 !bg-background !p-0 sm:!max-w-[560px] md:!max-w-[880px] max-h-[90vh] overflow-y-auto"
      >
        <DialogClose
          aria-label="Close"
          className="group/close absolute right-16 top-16 z-10 inline-flex size-40 items-center justify-center border border-foreground/15 bg-background text-foreground/70 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <X className="size-18 transition-transform duration-(--duration-quick) ease-(--ease-back-out) group-hover/close:rotate-90" />
        </DialogClose>
        <div className="grid md:grid-cols-2">
          {media ? <div className="relative md:order-last">{media}</div> : null}
          <div className="flex flex-col gap-32 p-24 lg:gap-40 lg:p-40">
            <div className="flex flex-col gap-16">
              <DialogTitle className="text-h3 font-medium text-balance text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription asChild={true}>
                <div className="text-body text-foreground-muted">{children}</div>
              </DialogDescription>
            </div>
            {facts?.length ? <DescriptionList items={facts} /> : null}
            <div className="mt-auto flex flex-col gap-12">
              {primary ? (
                <Button
                  href={primary.href}
                  theme="brand"
                  className="w-full"
                  onClick={() => onAction?.('primary')}
                  {...getExternalLinkProps(primary)}
                >
                  {primary.label}
                </Button>
              ) : null}
              <div className="grid grid-cols-2 gap-12">
                {secondary ? (
                  <SecondaryButton
                    href={secondary.href}
                    fullWidth={true}
                    onClick={() => onAction?.('secondary')}
                    {...getExternalLinkProps(secondary)}
                  >
                    {secondary.label}
                  </SecondaryButton>
                ) : null}
                <SecondaryButton
                  fullWidth={true}
                  onClick={() => onOpenChange?.(false)}
                  className={secondary ? undefined : 'col-span-2'}
                >
                  {dismissLabel}
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AffiliateModalMedia() {
  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center px-24 pt-72 pb-32 md:p-32 md:pt-72">
      <GroundBackground tone="dusk" />
      <AffiliateEarningsCard className="relative" />
    </div>
  );
}

// NOTE: module id: 634401
export default function AffiliateModal({ open, onOpenChange, onAction }) {
  return (
    <PromoDialog
      open={open}
      onOpenChange={onOpenChange}
      onAction={onAction}
      media={<AffiliateModalMedia />}
      title="Recommend GameVault. Keep 25% of every payment."
      facts={[
        { label: 'Cookie', value: '30 days' },
        { label: 'Payouts', value: 'Monthly' }
      ]}
      primary={{
        label: 'Get your link',
        href: AFFILIATE_URL,
        external: true
      }}
      secondary={{
        label: 'How it works',
        href: '/affiliate'
      }}
    >
      Our affiliate program is open. When someone buys the Library or a Kit through your link, a quarter of everything they pay goes to you, for as long as they stay, renewals included.
    </PromoDialog>
  );
}

