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
        'material border-separator sticky top-0 z-20 border-b-[0.5px] pt-[env(safe-area-inset-top)]',
        desktopOnly && 'hidden lg:block',
      )}
    >
      <div className="page-width safe-x flex h-12 items-center justify-between lg:h-14">
        <Link to="/" className="rounded text-[17px] font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <div className="-mr-2 lg:hidden">
          <HeaderMenu label="Konto" icon={<AccountIcon className="size-[26px]" />}>
            {(close) => (
              <>
                <ThemePicker />
                <div className="bg-separator mx-2 my-1 h-[0.5px]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    close();
                    handleSignOut();
                  }}
                  className="text-danger-ink hover:bg-fill flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-base"
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
            className="text-link hover:bg-fill min-h-11 rounded-lg px-3 text-[15px]"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
