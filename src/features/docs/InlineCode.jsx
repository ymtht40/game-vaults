export default function InlineCode({ children }) {
  return (
    <code className="bg-foreground/[0.06] px-6 py-1 font-mono text-[0.9em] text-foreground">
      {children}
    </code>
  );
}
