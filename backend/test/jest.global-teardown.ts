// test/jest.global-teardown.ts
import { execSync } from 'child_process';
import { resolve } from 'path';

export default async function globalTeardown() {
    console.log('\n--- Tearing down E2E Test Environment (Docker Compose) ---');

    // Roep het script aan dat de container stopt en de volume data verwijdert.
    execSync('pnpm db:test:down', {
        stdio: 'inherit',
        cwd: resolve(__dirname, '..', '..')
    });
    console.log('🗑️ Teardown complete. Test environment cleaned.');
}