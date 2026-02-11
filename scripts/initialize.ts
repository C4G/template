import { execSync, spawn } from 'child_process';

const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 2000;

function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

function checkPostgresReady(): boolean {
  try {
    const databaseUser = process.env.DATABASE_USER || 'postgres';
    execSync(
      `docker compose exec -T template-db pg_isready -U ${databaseUser}`,
      {
        stdio: 'pipe',
      }
    );
    return true;
  } catch {
    return false;
  }
}

async function waitForPostgres(): Promise<void> {
  console.log('⏳ Waiting for PostgreSQL to be ready...');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (checkPostgresReady()) {
      console.log('✅ PostgreSQL is ready!');
      return;
    }

    console.log(
      `⏳ Waiting for PostgreSQL... (attempt ${attempt}/${MAX_RETRIES})`
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
  }

  throw new Error('❌ ERROR: PostgreSQL did not become ready in time');
}

async function main() {
  try {
    console.log('🚀 Starting Docker Compose services...');
    await runCommand('docker', ['compose', 'up', '-d']);

    await waitForPostgres();

    console.log('🔄 Running Prisma migrations...');
    await runCommand('pnpm', ['prisma', 'migrate', 'dev']);

    console.log('⚙️  Generating Prisma client...');
    await runCommand('pnpm', ['prisma', 'generate']);

    console.log('🌱 Seeding database...');
    await runCommand('pnpm', ['prisma', 'db', 'seed']);

    console.log('🎉 Initialization complete!');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
