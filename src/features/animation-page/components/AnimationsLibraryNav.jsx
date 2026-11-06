// src/features/animation-page/components/AnimationsLibraryNav.jsx
'use client';

// Variable Mapping:
//   b -> MobileFiltersSheet
//   y -> FilterSheetSection
//   N -> FilterOptionItem
//   v -> ActiveFilterIndicator
//   V -> ViewModeTabs
//   M -> FilterDropdown
//   S -> searchInputRef
//   R -> categoryDropdownOpen, I -> setCategoryDropdownOpen
//   D -> interactionDropdownOpen, O -> setInteractionDropdownOpen
//   _ -> sortDropdownOpen, T -> setSortDropdownOpen
//   U -> mobileSheetOpen, $ -> setMobileSheetOpen
//   B -> isMac, G -> setIsMac
//   K -> handleViewModeChange
//   q -> handleCategorySelect
//   P -> handleInteractionSelect
//   W -> flatCategories
//   X -> selectedCategoryLabel
//   Y -> selectedInteractionLabel
//   J -> selectedSortLabel

import { Fragment, useEffect, useRef, useState } from 'react';
import { CaretDown, Check, Columns, CursorClick, MagnifyingGlass, SquaresFour, Rows, X } from '@phosphor-icons/react';
import AnimatedNumber from '@/animations/AnimatedNumber'; // NOTE: module id: 162387
import AnimatedTabs from '@/animations/AnimatedTabs'; // NOTE: module id: 876355
import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
import { useScrollLockContext } from '@/contexts/ScrollLockProvider'; // NOTE: module id: 441409

function ActiveFilterIndicator() {
  return (
    <span
      aria-hidden="true"
      className="size-8 shrink-0 bg-brand"
    />
  );
}

function MobileFiltersSheet({
  open,
  onClose,
  activeFilters,
  flatCategoryOptions,
  onCategorySelect,
  interaction,
  interactionOptions,
  onInteractionSelect,
  freeOnly,
  onFreeChange,
  freeCount,
  sortBy,
  sortOptions,
  onSortChange,
  viewMode,
  onViewModeChange,
  allLabel = 'All categories',
  sheetTitle = 'Category',
}) {
  const { lockScroll, unlockScroll } = useScrollLockContext();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    lockScroll();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockScroll();
    };
  }, [open, onClose, lockScroll, unlockScroll]);

  const state = open ? 'open' : 'closed';

  return (
    <>
      <div
        onClick={onClose}
        data-state={state}
        data-lenis-prevent={true}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[199] bg-background/70 backdrop-blur-sm md:hidden',
          'transition-opacity duration-(--duration-snap) ease-(--ease-expo-out)',
          'data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0',
          'data-[state=open]:opacity-100'
        )}
      />
      <div
        data-theme="dark"
        data-state={state}
        data-lenis-prevent={true}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!open}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[200] max-h-[85vh] overflow-y-auto overscroll-none bg-surface text-foreground md:hidden',
          'transition-transform duration-(--duration-snap) ease-(--ease-expo-out)',
          'data-[state=closed]:translate-y-full',
          'data-[state=open]:translate-y-0'
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-foreground/10 bg-surface px-16 py-16">
          <h2 className="text-accent-xs text-foreground-muted">Filter & sort</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex size-32 items-center justify-center text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground"
          >
            <X className="size-18" />
          </button>
        </div>

        <FilterSheetSection title={sheetTitle}>
          <FilterOptionItem
            label={allLabel}
            active={activeFilters.length === 0}
            onClick={() => onCategorySelect(null)}
          />
          {flatCategoryOptions.map((cat) => (
            <FilterOptionItem
              key={cat.value}
              label={cat.label}
              count={cat.count}
              active={activeFilters.includes(cat.value)}
              onClick={() => onCategorySelect(cat.value)}
            />
          ))}
        </FilterSheetSection>

        {interactionOptions?.length > 0 && (
          <FilterSheetSection title="Interaction">
            <FilterOptionItem
              label="Any interaction"
              active={!interaction}
              onClick={() => onInteractionSelect(null)}
            />
            {interactionOptions.map((opt) => (
              <FilterOptionItem
                key={opt.value}
                label={opt.label}
                count={opt.count}
                active={interaction === opt.value}
                onClick={() => onInteractionSelect(opt.value)}
              />
            ))}
          </FilterSheetSection>
        )}

        {onFreeChange && (
          <FilterSheetSection title="Free components">
            <FilterOptionItem
              label="All components"
              active={!freeOnly}
              onClick={() => onFreeChange(false)}
            />
            <FilterOptionItem
              label="Free only"
              count={freeCount}
              active={freeOnly}
              onClick={() => onFreeChange(true)}
            />
          </FilterSheetSection>
        )}

        <FilterSheetSection title="Sort by">
          {sortOptions.map((sort) => (
            <FilterOptionItem
              key={sort.value}
              label={sort.label}
              active={sortBy === sort.value}
              onClick={() => onSortChange(sort.value)}
            />
          ))}
        </FilterSheetSection>

        <FilterSheetSection title="View">
          <div className="grid grid-cols-3 gap-8">
            {VIEW_MODE_OPTIONS.map(({ id, label, Icon }) => {
              const active = viewMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onViewModeChange(id)}
                  aria-label={label}
                  aria-pressed={active}
                  className={cn(
                    'text-accent-xs flex items-center justify-center gap-8 px-12 py-14 transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
                    active
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-foreground-muted hover:bg-foreground/5 hover:text-foreground'
                  )}
                >
                  <Icon className="size-16" />
                  <span>{label.replace(' view', '')}</span>
                </button>
              );
            })}
          </div>
        </FilterSheetSection>
      </div>
    </>
  );
}

function FilterSheetSection({ title, children }) {
  return (
    <section className="border-b border-foreground/10 px-16 py-16 last:border-b-0">
      <h3 className="text-accent-xs mb-12 text-foreground-muted">{title}</h3>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

function FilterOptionItem({ label, count, active, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'text-body-sm flex w-full items-center justify-between gap-12 py-12 text-left transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
          active ? 'text-foreground' : 'text-foreground hover:text-foreground-muted'
        )}
      >
        <span>{label}</span>
        <span className="flex items-center gap-8">
          {count != null && (
            <span className="text-accent-xs text-foreground-muted">{count}</span>
          )}
          {active && <ActiveFilterIndicator />}
        </span>
      </button>
    </li>
  );
}

// NOTE: module id: 108800 (export VIEW_MODES)
export const VIEW_MODES = {
  GRID: 'grid',
  DUO: 'duo',
  LIST: 'list',
};

const STORAGE_VIEW_KEY = 'gamevault_view_mode';

const VIEW_MODE_OPTIONS = [
  {
    id: VIEW_MODES.DUO,
    label: 'Duo view',
    Icon: Columns,
  },
  {
    id: VIEW_MODES.GRID,
    label: 'Grid view',
    Icon: SquaresFour,
  },
  {
    id: VIEW_MODES.LIST,
    label: 'List view',
    Icon: Rows, // NOTE: module id: 499839
  },
];

function ViewModeTabs({ viewMode, onChange }) {
  return (
    <AnimatedTabs
      activeId={viewMode}
      containerClassName="items-center"
      role="tablist"
    >
      {VIEW_MODE_OPTIONS.map(({ id, label, Icon }) => {
        const isActive = viewMode === id;
        return (
          <button
            key={id}
            type="button"
            data-flip-id={id}
            onClick={() => onChange(id)}
            aria-label={label}
            aria-pressed={isActive}
            role="tab"
            className={cn(
              'relative z-10 flex size-48 items-center justify-center transition-colors duration-(--duration-fast) ease-(--ease-expo-out)',
              isActive ? 'text-foreground' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            <Icon className="size-16" />
          </button>
        );
      })}
    </AnimatedTabs>
  );
}

function FilterDropdown({ trigger, open, onOpenChange, children, menuClass = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      {trigger}
      <div
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'text-body-sm absolute bottom-full left-0 z-50 mb-2 min-w-[220px] origin-bottom overflow-hidden bg-surface text-foreground shadow-lg',
          'transition-[opacity,transform] duration-(--duration-snap) ease-(--ease-expo-out)',
          'data-[state=closed]:pointer-events-none data-[state=closed]:translate-y-4 data-[state=closed]:scale-95 data-[state=closed]:opacity-0',
          'data-[state=open]:translate-y-0 data-[state=open]:scale-100 data-[state=open]:opacity-100',
          menuClass
        )}
        aria-hidden={!open}
      >
        {children}
      </div>
    </div>
  );
}

// NOTE: module id: 108800
export default function AnimationsLibraryNav({
  activeFilters = [],
  onFiltersChange,
  interaction = null,
  onInteractionChange,
  interactionOptions = [],
  freeOnly = false,
  onFreeChange,
  freeCount = 0,
  sortBy = 'recent',
  onSortChange,
  viewMode = VIEW_MODES.GRID,
  onViewModeChange,
  searchValue = '',
  onSearchChange,
  filterOptions = [],
  sortOptions = [],
  count = 0,
  isAuthenticated = false,
  allLabel = 'All categories',
  searchPlaceholder = 'Search animations...',
}) {
  const searchInputRef = useRef(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [interactionDropdownOpen, setInteractionDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes('MAC'));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = (navigator.platform.toUpperCase().includes('MAC') ? e.metaKey : e.ctrlKey);
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_VIEW_KEY);
    if (saved && Object.values(VIEW_MODES).includes(saved) && saved !== viewMode) {
      onViewModeChange(saved);
    }
  }, []);

  const handleViewModeChange = (mode) => {
    sessionStorage.setItem(STORAGE_VIEW_KEY, mode);
    onViewModeChange(mode);
  };

  const handleCategorySelect = (value) => {
    if (value === null || activeFilters.includes(value)) {
      onFiltersChange([]);
    } else {
      onFiltersChange([value]);
    }
    setCategoryDropdownOpen(false);
  };

  const handleInteractionSelect = (value) => {
    onInteractionChange?.(value === interaction ? null : value);
    setInteractionDropdownOpen(false);
  };

  const flatCategories = filterOptions.flatMap((group) => group.options || []);
  const selectedCategoryLabel =
    flatCategories.find((cat) => cat.value === activeFilters[0])?.label || allLabel;
  const selectedInteractionLabel =
    interactionOptions.find((opt) => opt.value === interaction)?.label || 'Any interaction';
  const selectedSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || 'Recent';

  return (
    <>
      <div className="pointer-events-none sticky bottom-24 z-[100] flex justify-center px-16">
        <div
          data-theme="dark"
          className="pointer-events-auto flex w-full max-w-full items-stretch bg-surface text-foreground md:w-auto"
        >
          {/* Matching counter */}
          <div className="text-accent-xs hidden items-center gap-6 px-16 text-foreground-muted md:flex">
            <AnimatedNumber
              value={count}
              minDigits={1}
              triggerMode="immediate"
              duration={0.8}
              valueChangeDuration={1.2}
              ease="power3.inOut"
              className="text-accent-xs leading-none"
            />
            <span>matching</span>
          </div>

          <span aria-hidden="true" className="hidden w-px self-stretch bg-foreground/10 md:block" />

          {/* Category dropdown */}
          <div className="hidden items-stretch md:flex">
            <FilterDropdown
              open={categoryDropdownOpen}
              onOpenChange={setCategoryDropdownOpen}
              trigger={
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                  className="text-accent-xs flex items-center gap-8 px-12 py-14 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                  aria-haspopup="listbox"
                  aria-expanded={categoryDropdownOpen}
                >
                  <SquaresFour className="size-14 text-foreground-muted" />
                  <span className="truncate">{selectedCategoryLabel}</span>
                  <CaretDown
                    className={cn(
                      'size-14 text-foreground-muted transition-transform duration-(--duration-fast) ease-(--ease-expo-out)',
                      categoryDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>
              }
            >
              <ul role="listbox" className="max-h-[60vh] overflow-y-auto py-4">
                <li>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(null)}
                    className="flex w-full items-center justify-between gap-12 px-12 py-10 text-left text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                  >
                    <span>{allLabel}</span>
                    {activeFilters.length === 0 && <ActiveFilterIndicator />}
                  </button>
                </li>
                <li aria-hidden="true" className="my-4 h-px bg-foreground/10" />
                {flatCategories.map((item) => (
                  <li key={item.value}>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(item.value)}
                      className="flex w-full items-center justify-between gap-12 px-12 py-10 text-left text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                    >
                      <span>{item.label}</span>
                      <span className="flex items-center gap-8">
                        {item.count != null && (
                          <span className="text-accent-2xs text-foreground-muted">
                            {item.count}
                          </span>
                        )}
                        {activeFilters.includes(item.value) && <ActiveFilterIndicator />}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </FilterDropdown>

            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                aria-label="Clear category filter"
                className="flex items-center px-8 text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground"
              >
                <X className="size-14" />
              </button>
            )}
          </div>

          <span aria-hidden="true" className="hidden w-px self-stretch bg-foreground/10 md:block" />

          {/* Interaction dropdown */}
          {interactionOptions.length > 0 && (
            <>
              <div className="hidden items-stretch md:flex">
                <FilterDropdown
                  open={interactionDropdownOpen}
                  onOpenChange={setInteractionDropdownOpen}
                  trigger={
                    <button
                      type="button"
                      onClick={() => setInteractionDropdownOpen((prev) => !prev)}
                      className="text-accent-xs flex items-center gap-8 px-12 py-14 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                      aria-haspopup="listbox"
                      aria-expanded={interactionDropdownOpen}
                    >
                      <CursorClick className="size-14 text-foreground-muted" />
                      <span className="truncate">{selectedInteractionLabel}</span>
                      <CaretDown
                        className={cn(
                          'size-14 text-foreground-muted transition-transform duration-(--duration-fast) ease-(--ease-expo-out)',
                          interactionDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  }
                >
                  <ul role="listbox" className="py-4">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleInteractionSelect(null)}
                        className="flex w-full items-center justify-between gap-12 px-12 py-10 text-left text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                      >
                        <span>Any interaction</span>
                        {!interaction && <ActiveFilterIndicator />}
                      </button>
                    </li>
                    <li aria-hidden="true" className="my-4 h-px bg-foreground/10" />
                    {interactionOptions.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          onClick={() => handleInteractionSelect(opt.value)}
                          className="flex w-full items-center justify-between gap-12 px-12 py-10 text-left text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                        >
                          <span>{opt.label}</span>
                          <span className="flex items-center gap-8">
                            {opt.count != null && (
                              <span className="text-accent-2xs text-foreground-muted">
                                {opt.count}
                              </span>
                            )}
                            {interaction === opt.value && <ActiveFilterIndicator />}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </FilterDropdown>

                {interaction && (
                  <button
                    type="button"
                    onClick={() => handleInteractionSelect(null)}
                    aria-label="Clear interaction filter"
                    className="flex items-center px-8 text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground"
                  >
                    <X className="size-14" />
                  </button>
                )}
              </div>
              <span aria-hidden="true" className="hidden w-px self-stretch bg-foreground/10 md:block" />
            </>
          )}

          {/* Free toggle */}
          {onFreeChange && (
            <>
              <button
                type="button"
                onClick={() => onFreeChange(!freeOnly)}
                aria-pressed={freeOnly}
                className="text-accent-xs hidden items-center gap-8 px-12 py-14 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10 md:flex"
              >
                <span>Free</span>
                {freeOnly ? (
                  <ActiveFilterIndicator />
                ) : (
                  <span className="text-accent-2xs text-foreground-muted">{freeCount}</span>
                )}
              </button>
              <span aria-hidden="true" className="hidden w-px self-stretch bg-foreground/10 md:block" />
            </>
          )}

          {/* Search bar */}
          <label className="relative flex flex-1 items-stretch md:flex-initial">
            <MagnifyingGlass
              className="pointer-events-none absolute left-12 top-1/2 size-16 -translate-y-1/2 text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out)"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="text-body-sm h-full w-full bg-transparent py-14 pl-36 pr-64 text-foreground placeholder:text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) focus:outline-none md:min-w-[360px]"
            />
            {searchValue ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-12 top-1/2 flex size-20 -translate-y-1/2 items-center justify-center text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground"
              >
                <X className="size-14" />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-12 top-1/2 flex -translate-y-1/2 select-none items-center gap-4"
              >
                <kbd className="text-accent-2xs flex h-20 min-w-20 items-center justify-center bg-foreground/10 px-4 font-medium text-foreground-muted">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="text-accent-2xs flex h-20 min-w-20 items-center justify-center bg-foreground/10 px-4 font-medium text-foreground-muted">
                  K
                </kbd>
              </span>
            )}
          </label>

          <span aria-hidden="true" className="hidden w-px self-stretch bg-foreground/10 md:block" />

          {/* Sort dropdown */}
          <div className="hidden items-stretch md:flex">
            <FilterDropdown
              open={sortDropdownOpen}
              onOpenChange={setSortDropdownOpen}
              trigger={
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen((prev) => !prev)}
                  className="text-accent-xs flex items-center gap-8 px-12 py-14 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                  aria-haspopup="listbox"
                  aria-expanded={sortDropdownOpen}
                >
                  <span className="truncate">{selectedSortLabel}</span>
                  <CaretDown
                    className={cn(
                      'size-14 text-foreground-muted transition-transform duration-(--duration-fast) ease-(--ease-expo-out)',
                      sortDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>
              }
            >
              <ul role="listbox" className="py-4">
                {sortOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onSortChange(opt.value);
                        setSortDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-12 px-12 py-10 text-left text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10"
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <ActiveFilterIndicator />}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterDropdown>
          </div>

          <span aria-hidden="true" className="hidden w-px self-stretch bg-foreground/10 md:block" />

          {/* View mode toggle */}
          <div className="hidden items-stretch md:flex">
            <ViewModeTabs viewMode={viewMode} onChange={handleViewModeChange} />
          </div>

          <span aria-hidden="true" className="w-px self-stretch bg-foreground/10 md:hidden" />

          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className="text-accent-xs flex items-center gap-8 px-16 py-14 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:bg-foreground/10 md:hidden"
            aria-label="Open filters"
          >
            <SquaresFour className="size-16 text-foreground-muted" />
            <span>Filter</span>
          </button>

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              aria-label="Clear category filter"
              className="flex items-center pr-12 text-foreground-muted transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground md:hidden"
            >
              <X className="size-14" />
            </button>
          )}
        </div>
      </div>

      <MobileFiltersSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        activeFilters={activeFilters}
        flatCategoryOptions={flatCategories}
        onCategorySelect={handleCategorySelect}
        interaction={interaction}
        interactionOptions={interactionOptions}
        onInteractionSelect={handleInteractionSelect}
        freeOnly={freeOnly}
        onFreeChange={onFreeChange}
        freeCount={freeCount}
        sortBy={sortBy}
        sortOptions={sortOptions}
        onSortChange={onSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        allLabel={allLabel}
        sheetTitle={filterOptions[0]?.label || 'Category'}
      />
    </>
  );
}