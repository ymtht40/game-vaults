import { BrandMark } from '@/components/ui/BrandMark'; // NOTE: module id: 843028
import { AnnnimateLogo } from '@/assets/logos/AnnnimateLogo'; // NOTE: module id: 867584
// UNRESOLVED: AnnnimateLogo is a usage-based export name.

// Variable Mapping: F -> MockupBrand
// NOTE: module id: 572332
export function MockupBrand() {
  return (
    <div className="mb-24 flex items-center gap-8 px-8 py-4 text-foreground">
      <BrandMark height={16} />
      <AnnnimateLogo height={14} className="text-foreground" />
    </div>
  );
}
