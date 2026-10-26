import { requireUser } from '../current-user';

/** The signed-in mechanic's name, for the header. Reads the session: render it inside <Suspense>. */
export async function MechanicName() {
  const user = await requireUser();
  return `${user.firstName} ${user.lastName}`;
}

/** Holds the name's place while the session is checked. */
export function MechanicNameFallback() {
  return <span aria-hidden="true" className="inline-block h-4 w-36 rounded-[4px] bg-ground align-middle" />;
}
