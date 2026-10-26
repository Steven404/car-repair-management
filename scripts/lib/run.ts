import { db } from '@/lib/db/client';
import { env } from '@/lib/env';

/**
 * Runs a script's body: says which database it is about to change, prints a
 * failure as one line instead of a stack trace, and closes the connection.
 */
export function runScript(title: string, body: () => Promise<void>) {
  console.log(`${title}\nDatabase: ${env.TURSO_DATABASE_URL}\n`);

  body()
    .catch((error: unknown) => {
      console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    })
    .finally(() => db.$client.close());
}
