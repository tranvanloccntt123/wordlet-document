import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const TARGET_DATABASE_VERSION = 4; // Incremented database version

  // Get current database version
  const versionResult = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  let currentDbVersion = versionResult ? versionResult.user_version : 0;

  if (currentDbVersion >= TARGET_DATABASE_VERSION) {
    console.log(
      `Database is already at version ${currentDbVersion} (target: ${TARGET_DATABASE_VERSION}). No migration needed.`
    );
    return;
  }

  console.log(
    `Current DB version: ${currentDbVersion}. Target DB version: ${TARGET_DATABASE_VERSION}. Starting migration...`
  );

  // Migration to version 1: Create fts_words table
  if (currentDbVersion < 1) {
    console.log("Applying migration to version 1...");
    await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE VIRTUAL TABLE IF NOT EXISTS fts_words USING fts4(
          word TEXT,
          content TEXT,
          parsedword TEXT,
          source TEXT,
          tokenize=porter
        );
      `);
    await db.execAsync("PRAGMA user_version = 1");
    currentDbVersion = 1; // Update current version after successful migration
    console.log("Migration to version 1 completed.");
  }

  // Migration to version 2: Create history table
  if (currentDbVersion < 4) {
    await db.execAsync(`DROP TABLE IF EXISTS history;`);
    console.log("Applying migration to version 4...");
    try {
      await db.execAsync(`
            CREATE TABLE IF NOT EXISTS history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              score INTEGER,
              date TEXT,
              message TEXT
            );
          `);
    } catch (e) {
      console.log(e);
    }
    currentDbVersion = 4; // Update current version after successful migration
    console.log("Migration to version 4 completed.");
  }

  await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);

  if (currentDbVersion === TARGET_DATABASE_VERSION) {
    console.log(
      `Database migration successful. Now at version ${currentDbVersion}.`
    );
  } else {
    console.warn(
      `Database migration might be incomplete. Current version: ${currentDbVersion}, Target version: ${TARGET_DATABASE_VERSION}.`
    );
  }
}
