'use client';

// Variable Mapping: V -> MenuStageSection?, e -> kit, l -> components, i -> groupedMenus, s -> hasComponents, o -> selectedSlug, c -> setSelectedSlug, d -> isPhoneViewport, m -> setIsPhoneViewport, h -> resetKey, u -> setResetKey, g -> sectionRef, p -> isInView, H -> setIsInView, v -> handleSelectMenu, j -> handleSelectViewport, M -> previewUrl, Z -> activeMenu

import { useEffect, useMemo, useRef, useState } from 'react';
import { MonitorIcon } from '@phosphor-icons/react';
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160 // UNRESOLVED: name guessed from usage
import AnimatedText from '@/components/motion/AnimatedText'; // NOTE: module id: 218091 // UNRESOLVED: name guessed from usage
import { PhoneIcon } from '@/assets/icons'; // NOTE: module id: 954243 // UNRESOLVED: name guessed from usage
import { ReplayIcon } from '@/assets/icons'; // NOTE: module id: 182006 // UNRESOLVED: name guessed from usage
import Select from '@/components/ui/Select'; // NOTE: module id: 977805 // UNRESOLVED: name guessed from usage
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { groupComponentsByKind } from '@/features/kits/utils/menuKits'; // NOTE: module id: 12426 // UNRESOLVED: name guessed from usage
import { MenuVariantIcon } from '@/features/kits/menu/MenuVariantIcon'; // NOTE: module id: 37418
import { StageViewportButton } from '@/features/kits/menu/StageViewportButton'; // NOTE: module id: 37418

// NOTE: module id: 37418
export function MenuStageSection({ kit }) {
  const components = kit?.components || [];
  const groupedMenus = useMemo(
    () => groupComponentsByKind(components),
    [components]
  );
  const hasComponents = components.length > 0;
  const [selectedSlug, setSelectedSlug] = useState(
    () =>
      components.find((item) => item.slug === 'accordion')?.slug ||
      components[0]?.slug ||
      ''
  );
  const [isPhoneViewport, setIsPhoneViewport] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || isInView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px -20% 0px',
      }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isInView]);

  const handleSelectMenu = (nextSlug) => {
    if (nextSlug !== selectedSlug) {
      setSelectedSlug(nextSlug);
      setResetKey((prev) => prev + 1);
    }
  };

  const handleSelectViewport = (nextPhoneMode) => {
    if (nextPhoneMode !== isPhoneViewport) {
      setIsPhoneViewport(nextPhoneMode);
      setResetKey((prev) => prev + 1);
    }
  };

  const previewUrl =
    hasComponents && isInView && selectedSlug
      ? `/api/sandbox/kit/${kit.slug}/${selectedSlug}`
      : null;
  const activeMenu = components.find((item) => item.slug === selectedSlug);

  return (
    <section
      ref={sectionRef}
      data-buybar-hide=""
      data-theme="light"
      className="bg-background text-foreground"
    >
      <div className="v2-container py-64 lg:py-96">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <span className="text-mono-sm text-foreground-muted">
              The stage
            </span>
            <RevealHeading
              as="h2"
              sizeClass="text-h2"
              trigger="scroll"
              className="mt-16 max-w-[24ch] font-medium"
            >
              Open every one of them.
            </RevealHeading>
            <AnimatedText
              triggerMode="scroll"
              className="text-body-lg mt-16 max-w-[62ch] leading-relaxed text-foreground-muted"
            >
              Pick a menu and click its trigger. The page behind it never
              changes, so the only thing you are comparing is the menu.{' '}
              <span className="max-lg:hidden">
                Switch the stage to phone to check the mobile behaviour, which
                is where most menus quietly fall apart.
              </span>
            </AnimatedText>
            {hasComponents ? (
              <div className="mt-40 flex flex-col border border-foreground/15 bg-foreground/[0.04] lg:grid lg:grid-cols-[280px_1fr]">
                <div
                  data-theme="dark"
                  className="flex items-center gap-8 border-b border-foreground/15 bg-background p-20 text-foreground lg:flex-col lg:items-stretch lg:gap-0 lg:border-b-0 lg:border-r lg:p-0"
                >
                  <div className="min-w-0 flex-1 lg:hidden">
                    <Select
                      value={selectedSlug}
                      onChange={handleSelectMenu}
                      options={groupedMenus.flatMap((group) =>
                        group.items.map((item) => ({
                          value: item.slug,
                          label: item.title,
                        }))
                      )}
                      ariaLabel="Choose a menu"
                      size="lg"
                      className="w-full"
                    />
                  </div>
                  <div className="hidden flex-col gap-24 p-20 lg:flex lg:flex-1">
                    {groupedMenus.map((group) => (
                      <div key={group.id} className="flex flex-col">
                        <span className="border-b border-foreground/15 pb-8 text-mono-sm text-foreground">
                          {group.label}
                        </span>
                        <ul className="mt-8 flex flex-col">
                          {group.items.map((item) => {
                            const isSelected = item.slug === selectedSlug;
                            return (
                              <li key={item.slug}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectMenu(item.slug)}
                                  aria-pressed={isSelected}
                                  className={cn(
                                    'flex w-full items-center gap-10 py-8 text-left text-mono-sm transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
                                    isSelected
                                      ? 'text-brand'
                                      : 'text-foreground/55 hover:text-foreground'
                                  )}
                                >
                                  <MenuVariantIcon slug={item.slug} />
                                  <span className="truncate">{item.title}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 items-center gap-8 lg:border-t lg:border-foreground/15 lg:p-20">
                    <div
                      role="group"
                      aria-label="Stage viewport"
                      className="hidden border border-foreground/20 lg:flex"
                    >
                      <StageViewportButton
                        active={!isPhoneViewport}
                        onClick={() => handleSelectViewport(false)}
                        label="Desktop"
                        icon={<MonitorIcon size={12} />}
                      />
                      <StageViewportButton
                        active={isPhoneViewport}
                        onClick={() => handleSelectViewport(true)}
                        label="Phone"
                        icon={<PhoneIcon size={12} />}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetKey((prev) => prev + 1)}
                      aria-label="Reset the stage"
                      className="ml-auto flex items-center gap-6 bg-foreground px-10 py-8 text-background transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90 max-lg:h-48 max-lg:px-16 max-lg:text-body-sm lg:text-accent-xs"
                    >
                      <ReplayIcon size={12} />
                      Reset
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="relative flex h-[min(560px,64svh)] w-full flex-1 items-center max-lg:flex-none justify-center overflow-hidden bg-foreground/[0.06] lg:aspect-auto lg:h-full">
                    <div
                      className="h-full overflow-hidden bg-background transition-[width] duration-(--duration-snap) ease-(--ease-expo-out)"
                      style={
                        isPhoneViewport
                          ? {
                              width: '390px',
                              maxWidth: '100%',
                            }
                          : {
                              width: '100%',
                            }
                      }
                    >
                      {previewUrl ? (
                        <iframe
                          key={`${selectedSlug}-${isPhoneViewport ? 'phone' : 'desktop'}-${resetKey}`}
                          src={previewUrl}
                          title={
                            activeMenu
                              ? `${activeMenu.title} menu preview`
                              : 'Menu preview'
                          }
                          className="block size-full border-0"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-40 border border-foreground/15 bg-foreground/[0.04] px-20 py-24 text-body-sm leading-relaxed text-foreground-muted">
                The live stage lands with the Kit.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
