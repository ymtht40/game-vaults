// Variable Mapping: T -> RelatedAnimationsSection, e -> animation / item, s -> relatedAnimations, a -> isAuthenticated, n -> savedAnimationIds, r -> buildName, i -> matchingBuildCount, l -> hasSameBuildGroup, o -> headingText, w.R -> getProvenanceSite, P.default -> AnimationCard

import { getProvenanceSite } from '@/libs/utils/provenance'; // NOTE: module id: 809630
import AnimationCard from '@/animations/AnimationCard'; // NOTE: module id: 591611

// NOTE: module id: 521041
export default function RelatedAnimationsSection({
  animation,
  relatedAnimations = [],
  isAuthenticated = false,
  savedAnimationIds = [],
}) {
  if (!relatedAnimations || relatedAnimations.length === 0) return null;

  const buildName = getProvenanceSite(animation);
  const matchingBuildCount = buildName
    ? relatedAnimations.filter((item) => getProvenanceSite(item) === buildName).length
    : 0;
  const hasSameBuildGroup = buildName && matchingBuildCount >= 2;
  const headingText = hasSameBuildGroup
    ? `More from the ${buildName} build.`
    : 'Related components.';

  return (
    <section
      data-theme="dark"
      className="v2-container border-t border-foreground/10 py-32 lg:py-64"
    >
      <div className="grid grid-cols-12 gap-x-24 gap-y-32 lg:gap-y-0">
        <div className="col-span-12 mb-32 flex flex-wrap items-baseline justify-between gap-12 lg:mb-48">
          <div>
            <span className="text-accent-xs text-foreground-muted">
              {hasSameBuildGroup ? 'Build' : 'Related'}
            </span>
            <h2 className="text-h4 mt-12 text-foreground">{headingText}</h2>
          </div>
        </div>
        {relatedAnimations.slice(0, 3).map((item) => (
          <div key={item.id} className="col-span-12 md:col-span-6 lg:col-span-4">
            <AnimationCard
              animation={item}
              viewMode="grid"
              isAuthenticated={isAuthenticated}
              initialIsSaved={savedAnimationIds.includes(item.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
