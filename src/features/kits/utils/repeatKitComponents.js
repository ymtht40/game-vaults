// Variable Mapping: S -> repeatKitComponents, e -> components

// NOTE: module id: 8545
export function repeatKitComponents(components) {
  return components.length
    ? Array.from(
        {
          length: Math.ceil(25 / components.length),
        },
        () => components,
      ).flat()
    : [];
}
