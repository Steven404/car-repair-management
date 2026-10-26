import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { newPasswordProblem } from '@/features/auth/password';

// Questions for the user scripts. In a terminal, passwords are typed without
// being shown. With piped input (`printf … | pnpm user:add`), each answer is
// the next line, so the scripts can also run unattended.

let pipedLines: string[] | undefined;

async function nextPipedLine(): Promise<string> {
  if (!pipedLines) {
    const chunks: Buffer[] = [];
    for await (const chunk of stdin) chunks.push(chunk as Buffer);
    pipedLines = Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
  }
  return pipedLines.shift() ?? '';
}

export async function ask(question: string): Promise<string> {
  if (!stdin.isTTY) {
    stdout.write(`${question}\n`);
    return (await nextPipedLine()).trim();
  }
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function askHidden(question: string): Promise<string> {
  if (!stdin.isTTY) {
    stdout.write(`${question}\n`);
    return nextPipedLine();
  }

  return new Promise((resolve) => {
    let value = '';
    const finish = () => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
    };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          finish();
          resolve(value);
          return;
        }
        if (char === '\u0003') {
          // Ctrl+C
          finish();
          process.exit(130);
        }
        if (char === '\u007f' || char === '\b') value = [...value].slice(0, -1).join('');
        else if (char >= ' ') value += char;
      }
    };

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', onData);
  });
}

/** Asks twice and checks the rules in features/auth/password.ts; in a terminal, until it's right. */
export async function askNewPassword(): Promise<string> {
  for (;;) {
    const password = await askHidden('Password: ');
    const problem = newPasswordProblem(password);
    const repeated = problem ? undefined : await askHidden('Repeat the password: ');
    const error = problem ?? (repeated !== password ? 'The passwords are different.' : undefined);

    if (!error) return password;
    if (!stdin.isTTY) throw new Error(error);
    console.log(`${error} Try again.\n`);
  }
}
