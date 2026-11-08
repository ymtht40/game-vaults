import UserLoadingGate from '@/components/layout/UserLoadingGate';

export default function WelcomeLayout({ children }) {
  return (
    <UserLoadingGate>
      {children}
    </UserLoadingGate>
  );
}
