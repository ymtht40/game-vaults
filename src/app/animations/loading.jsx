import Loader from '@/components/ui/Loader';

export default function AnimationsLoading() {
  return (
    <div data-theme="dark" className="bg-background text-foreground" aria-busy="true">
      <div className="v2-container flex min-h-[50vh] items-center justify-center py-128">
        <Loader />
        <span className="sr-only">Loading animations...</span>
      </div>
    </div>
  );
}
