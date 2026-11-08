'use client';

import Loader from '@/components/ui/Loader'; // NOTE: module id: 461376
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220

// NOTE: module id: 540374
export default function UserLoadingGate({ children }) {
  const { loading } = useUser();

  return loading ? (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader size="40" />
    </div>
  ) : (
    <>{children}</>
  );
}

