import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746
// UNRESOLVED: cn is a usage-based name for the class-name helper.
import RevealHeading from '@/components/motion/RevealHeading'; // NOTE: module id: 963160
import FadeIn from '@/components/motion/FadeIn'; // NOTE: module id: 460391

// Variable Mapping: e -> children, n -> action, s -> className, i -> actionClass
// NOTE: module id: 118970
export function V3SectionHeader({
  children,
  action = null,
  className = 'max-w-[20ch]',
  actionClass = '',
}) {
  return (
    <div className="flex flex-col items-start gap-24 lg:flex-row lg:items-end lg:justify-between lg:gap-48">
      <RevealHeading
        as="h2"
        sizeClass="text-h2"
        className={cn('font-medium text-balance', className)}
        trigger="scroll"
      >
        {children}
      </RevealHeading>
      {action ? (
        <FadeIn trigger="scroll" delay={0.15} className={cn('shrink-0', actionClass)}>
          {action}
        </FadeIn>
      ) : null}
    </div>
  );
}
