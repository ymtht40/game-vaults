// Variable Mapping: x -> interpolateFacts, e -> facts, t -> replacements

// NOTE: module id: 547118
export const interpolateFacts = (facts, replacements) =>
  facts.map((fact) => ({
    label: fact.label,
    value: fact.value.replace(/\{(\w+)\}/g, (placeholder, key) =>
      null != replacements[key] ? String(replacements[key]) : placeholder,
    ),
  }));
