'use client';

// Variable Mapping: Z -> SuggestModal, e -> open, r -> onOpenChange, a -> isAuthenticated

import { CloseIcon } from '@/assets/icons'; // NOTE: module id: 137410 // UNRESOLVED: name guessed from usage
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/features/common/Dialog'; // NOTE: module id: 753145
import { SuggestForm } from '@/features/roadmap/SuggestForm'; // NOTE: module id: 626171

// NOTE: module id: 626171
export function SuggestModal({ open, onOpenChange, isAuthenticated }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!rounded-none !border-foreground/15 !bg-background !p-32 sm:!max-w-[560px] lg:!p-40"
      >
        <DialogClose
          aria-label="Close"
          className="group/close absolute right-16 top-16 inline-flex size-40 items-center justify-center border border-foreground/15 text-foreground/70 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:border-foreground/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <CloseIcon className="size-18 transition-transform duration-(--duration-quick) ease-(--ease-back-out) group-hover/close:rotate-90" />
        </DialogClose>
        <div className="flex flex-col gap-12">
          <p className="text-mono-sm text-foreground/55">Suggest a component</p>
          <DialogTitle className="text-h3 font-medium leading-tight text-foreground">
            Want a component that isn't here?
          </DialogTitle>
          <DialogDescription className="text-body text-foreground-muted">
            Tell us what you are trying to build. The best suggestions come from a real project, so describe the site, not just the effect.
          </DialogDescription>
        </div>
        <SuggestForm
          open={open}
          isAuthenticated={isAuthenticated}
          onSuccess={() => {
            setTimeout(() => onOpenChange(false), 1200);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
