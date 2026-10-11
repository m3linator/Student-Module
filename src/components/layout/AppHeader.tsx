import { Link } from 'react-router';
import { AccountIcon, LogoutIcon } from '@/components/ui/icons';
import { APP_NAME } from '@/config/app';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { HeaderMenu } from './HeaderMenu';
import { ThemeIcon, ThemePicker } from './ThemePicker';

/**
 * @brief Translucent top bar: app name left; account menu (mobile) or appearance menu plus
 *        "Abmelden" (desktop) on the right.
 * @param props.desktopOnly Hide the header below 1024 px (module page has its own bar there).
 * @returns The header.
 */
export function AppHeader({ desktopOnly = false }: { desktopOnly?: boolean }) {
  const { signOut } = useAuth();
  const handleSignOut = () => void signOut();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b-[0.5px] border-separator material pt-[env(safe-area-inset-top)]',
        desktopOnly && 'hidden lg:block',
      )}
    >
      <div className="page-width flex h-12 items-center justify-between safe-x lg:h-14">
        <Link to="/" className="rounded text-[17px] font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <div className="-mr-2 lg:hidden">
          <HeaderMenu label="Konto" icon={<AccountIcon className="size-[26px]" />}>
            {(close) => (
              <>
                <ThemePicker />
                <div className="mx-2 my-1 h-[0.5px] bg-separator" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    close();
                    handleSignOut();
                  }}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-base text-danger-ink hover:bg-fill"
                >
                  <LogoutIcon className="size-5" />
                  Abmelden
                </button>
              </>
            )}
          </HeaderMenu>
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          <HeaderMenu label="Darstellung" icon={<ThemeIcon />}>
            {() => <ThemePicker />}
          </HeaderMenu>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-11 rounded-lg px-3 text-[15px] text-link hover:bg-fill"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
