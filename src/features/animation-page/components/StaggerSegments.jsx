export default function StaggerSegments({ spread, count }) {
  const segmentCount = Math.min(count, 24);
  const segmentWidth = spread / segmentCount;

  return (
    <>
      {Array.from({ length: segmentCount }, (unused, index) => (
        <span
          key={`in-${index}`}
          className="absolute inset-y-0 border-r border-[rgb(var(--bar-c)/0.45)] bg-[rgb(var(--bar-c)/0.35)]"
          style={{
            left: `${index * segmentWidth * 100}%`,
            width: `${100 * segmentWidth}%`,
            opacity: (index + 1) / segmentCount,
          }}
        />
      ))}

      {1 - 2 * spread > 0 && (
        <span
          className="absolute inset-y-0 bg-[rgb(var(--bar-c)/0.35)]"
          style={{
            left: `${100 * spread}%`,
            width: `${(1 - 2 * spread) * 100}%`,
          }}
        />
      )}

      {Array.from({ length: segmentCount }, (unused, index) => (
        <span
          key={`out-${index}`}
          className="absolute inset-y-0 border-r border-[rgb(var(--bar-c)/0.45)] bg-[rgb(var(--bar-c)/0.35)]"
          style={{
            right: `${index * segmentWidth * 100}%`,
            width: `${100 * segmentWidth}%`,
            opacity: (index + 1) / segmentCount,
          }}
        />
      ))}
    </>
  );
}