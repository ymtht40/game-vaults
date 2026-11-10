'use client';

import React, { useRef } from 'react';
import { BrandLogo } from '@/assets/logos/BrandLogo'; // NOTE: module id: 635566
import Button from '@/components/ui/Button'; // NOTE: module id: 687989
import NavLink from '@/components/navigation/NavSurface'; // NOTE: module id: 520237
import PageEnterAnimation from '@/components/motion/PageEnterAnimation'; // NOTE: module id: 460391
import { DraggableGrid } from '@/components/motion/DraggableGrid'; // NOTE: module id: 73062
import { usePageEnterAnimation } from '@/providers/AnimationProvider'; // NOTE: module id: 488463

function ActionButton({ as: Component = 'button', icon, children, ...restProps }) {
  const baseClassName =
    'text-mono-sm flex h-48 w-full items-center justify-center gap-10 border border-foreground/15 bg-surface text-foreground transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/5 disabled:opacity-50';

  if (Component === 'a') {
    return (
      <a className={baseClassName} {...restProps}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type="button" className={baseClassName} {...restProps}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

const AUTH_GRID_LAYOUT = { rowCount: 9, cols: 9 };

function AuthStatusGrid({ images }) {
  const gridRef = useRef(null);

  usePageEnterAnimation(() => gridRef.current?.reveal(), [], 'AuthStatusGrid');

  if (!images.length) {
    return null;
  }

  return (
    <div className="absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
      <DraggableGrid
        ref={gridRef}
        images={images}
        entrance="center-out"
        layout={AUTH_GRID_LAYOUT}
        className="h-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_0%,color-mix(in_srgb,var(--background)_82%,transparent)_45%,color-mix(in_srgb,var(--background)_55%,transparent)_100%)]" />
    </div>
  );
}

// NOTE: module id: 430550
export function SentNotice({ to, subject, from = 'contact@drivexstore.shop' }) {
  return (
    <div className="flex flex-col gap-8 border border-foreground/15 bg-surface p-16">
      <p className="text-mono-sm text-foreground">Sent to {to || 'your inbox'}</p>
      <p className="text-body-sm text-foreground-reading">
        Subject <span className="text-foreground">“{subject}”</span> from {from}. Not there in a
        minute? Check spam or promotions.
      </p>
    </div>
  );
}

export function InstructionSteps({ title, steps = [] }) {
  return (
    <div className="flex flex-col gap-16 border border-foreground/15 bg-surface p-24">
      {title && <p className="text-mono-sm text-foreground">{title}</p>}
      <ol className="text-body-sm flex flex-col gap-8 text-foreground-reading">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-10">
            <span className="text-mono-sm flex size-20 shrink-0 items-center justify-center bg-foreground/10 text-foreground">
              {idx + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LibraryShowcaseLayout({
  images = [],
  icon = null,
  heading,
  body,
  detail = null,
  primary = null,
  secondary = null,
  footer = null,
  children = null,
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <AuthStatusGrid images={images} />
      <PageEnterAnimation
        className="relative flex min-h-screen flex-col gap-16 p-24 md:p-40"
        stagger={0.08}
      >
        <div className="flex items-center">
          <BrandLogo />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[26rem] border border-foreground/15 bg-background p-32">
            {icon && <div className="mb-24 flex justify-center text-foreground-muted">{icon}</div>}
            <header className="mb-24 text-center">
              <h1 className="text-h3 m-0 text-foreground">{heading}</h1>
              {body && <p className="text-body-sm mt-12 text-foreground-reading">{body}</p>}
            </header>
            {detail && <div className="mb-24">{detail}</div>}
            {children}
            {(primary || secondary) && (
              <div className="flex flex-col gap-12">
                {primary && (
                  <Button
                    href={primary.href}
                    onClick={primary.onClick}
                    type={primary.href ? undefined : 'button'}
                    theme="brand"
                    size="sm"
                    className="w-full"
                    loading={primary.loading}
                    disabled={primary.disabled}
                  >
                    {primary.label}
                  </Button>
                )}
                {secondary && secondary.href ? (
                  <ActionButton
                    as="a"
                    href={secondary.href}
                    target={secondary.target}
                    rel={secondary.rel}
                    icon={secondary.icon}
                  >
                    {secondary.label}
                  </ActionButton>
                ) : secondary ? (
                  <ActionButton onClick={secondary.onClick} icon={secondary.icon}>
                    {secondary.label}
                  </ActionButton>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <p className="text-center">
          <span className="text-mono-sm inline-block bg-background/85 px-16 py-8 text-foreground-muted">
            {footer || (
              <>
                Something off?{' '}
                <NavLink href="mailto:contact@drivexstore.shop" inline className="text-foreground">
                  Reply to any of our emails
                </NavLink>{' '}
                and we sort it by hand.
              </>
            )}
          </span>
        </p>
      </PageEnterAnimation>
    </div>
  );
}

