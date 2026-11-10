// Variable Mapping: y -> ProvenanceSection, e -> animation, s -> provenanceData, a -> buildName, n -> provenanceBody, w.N -> getProvenance, w.R -> getProvenanceSite, w.n -> getProvenanceBody, j.ProvenanceChip -> ProvenanceChip

import { ProvenanceChip } from '@/components/ui/ProvenanceChip'; // NOTE: module id: 909247
import { getProvenance, getProvenanceSite, getProvenanceDescription } from '@/libs/utils/provenance';


// NOTE: module id: 521041
export default function ProvenanceSection({ animation }) {
  const provenanceData = getProvenance(animation);
  const buildName = getProvenanceSite(animation);

  if (!provenanceData?.body && !buildName) return null;

  const provenanceBody = getProvenanceDescription(animation);

  return (
    <section className="pt-16">
      <ProvenanceChip animation={animation} size="default" />
      <h2 className="text-h4 mt-12 text-foreground">Where this component came from.</h2>
      <p className="text-body mt-16 leading-relaxed text-foreground-reading">
        {provenanceBody}
      </p>
    </section>
  );
}
