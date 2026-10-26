import { LogOut } from 'lucide-react';
import { navItemClasses } from '@/components/layout/navStyles';
import { logout } from '../actions';

/**
 * A form, not a link: Next prefetches links, and a logout link could sign the
 * mechanic out just by being hovered. On a phone it shrinks to its icon.
 */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className={navItemClasses}>
        <LogOut size={18} aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Αποσύνδεση</span>
      </button>
    </form>
  );
}
