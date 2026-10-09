import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/config/app';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { AccountMenu } from './AccountMenu';

/**
 * @brief Slim top bar: app name on the left, account menu (mobile) or "Abmelden" (desktop) right.
 * @param props.desktopOnly Hide the header below 1024 px (module page has its own bar there).
 * @returns The header.
 */
export function AppHeader({ desktopOnly = false }: { desktopOnly?: boolean }) {
  const { signOut } = useAuth();
  const handleSignOut = () => void signOut();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b border-gray-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur',
        desktopOnly && 'hidden lg:block',
      )}
    >
      <div className="page-width safe-x flex h-14 items-center justify-between">
        <Link to="/" className="rounded text-lg font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <div className="lg:hidden">
          <AccountMenu onSignOut={handleSignOut} />
        </div>
        <div className="hidden lg:block">
          <Button variant="ghost" onClick={handleSignOut}>
            Abmelden
          </Button>
        </div>
      </div>
    </header>
  );
}
