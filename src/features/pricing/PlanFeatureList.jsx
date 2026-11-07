/* Variable Mapping:
   P -> PlanFeatureList
   e -> items
   r -> featured
   a -> strong
   n -> isEmphasized
*/

// NOTE: module id: 586818
export function PlanFeatureList({ items, featured, strong = 0 }) {
  return (
    <ul className="flex flex-col gap-8">
      {items.map((item, idx) => {
        const isEmphasized = typeof item !== 'string' || idx < strong;
        const label = typeof item === 'string' ? item : item.label;

        return (
          <li
            key={label}
            className={`text-body-sm ${featured ? 'text-white' : 'text-foreground'} ${
              isEmphasized ? '' : 'opacity-50'
            }`}
          >
            {label}
          </li>
        );
      })}
    </ul>
  );
}
