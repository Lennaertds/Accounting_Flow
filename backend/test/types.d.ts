// test/types.d.ts

import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

// Declareer de globale variabele zodat TypeScript deze kent in alle testbestanden
declare global {
    var postgresContainer: StartedPostgreSqlContainer;
}

// Nodig om er zeker van te zijn dat TypeScript dit bestand als een module leest
export { };