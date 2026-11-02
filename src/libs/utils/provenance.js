// Variable Mapping: n -> VALID_PROVENANCE_TYPES, r -> SITE_PROVENANCE_TYPES, i -> getProvenance, N -> getProvenance, s -> getProvenanceLabel, E -> getProvenanceLabel, R -> getProvenanceSite, e -> animation, t -> provenance, a -> clientSite

const VALID_PROVENANCE_TYPES = new Set([
  'client_commissioned',
  'internal_project',
  'studio_original'
]);

const SITE_PROVENANCE_TYPES = new Set([
  'client_commissioned',
  'internal_project'
]);

// NOTE: module id: 809630
export function getProvenance(animation) {
  const provenance = animation?.metadata?.provenance;
  return provenance &&
    typeof provenance === 'object' &&
    VALID_PROVENANCE_TYPES.has(provenance.type)
    ? provenance
    : null;
}

export function getProvenanceDescription(animation) {
  const provenance = getProvenance(animation);
  if (provenance?.body) return provenance.body;
  if (provenance?.site) {
    if (provenance.type === 'client_commissioned') {
      const clientSite = provenance.site;
      return `We built it for the ${clientSite} site and folded it back into the library when the project went live. A Good Fella piece, refined for reuse.`;
    }
    if (provenance.type === 'internal_project') {
      const internalSite = provenance.site;
      return `We built it for ${internalSite}, our own site, and kept it in the library once it earned its place. The same code runs in production today.`;
    }
  }
  return 'We built it for the library deliberately, not against a client brief, and kept it once it earned its place here.';
}

export function getProvenanceLabel(animation) {
  const provenance = getProvenance(animation);
  if (provenance && SITE_PROVENANCE_TYPES.has(provenance.type) && provenance.site) {
    const contextSuffix = provenance.context ? ` ${provenance.context}` : '';
    return `Built for ${provenance.site}${contextSuffix}.`;
  }
  return 'A Good Fella original.';
}

export function getProvenanceSite(animation) {
  const provenance = getProvenance(animation);
  return provenance && SITE_PROVENANCE_TYPES.has(provenance.type) && provenance.site
    ? provenance.site
    : null;
}
