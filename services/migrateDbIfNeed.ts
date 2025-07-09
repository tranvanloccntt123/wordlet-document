import * as Notifications from "expo-notifications";
import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const TARGET_DATABASE_VERSION = 17; // Incremented database version

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

  if (currentDbVersion < 5) {
    console.log("Migrate DB version 5");
    await db.execAsync(`DROP TABLE IF EXISTS history;`);
    await db.execAsync(`DROP TABLE IF EXISTS fts_words;`);
    currentDbVersion = 5;
  }

  if (currentDbVersion < 16) {
    console.log("Migrate DB version 16");
    await db.execAsync(`DROP TABLE IF EXISTS local_notifications;`);
    console.log("Migrate DB version 16 Dropped local_notifications");
    await db.execAsync(`CREATE TABLE IF NOT EXISTS local_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT,
      content TEXT,
      title TEXT,
      source TEXT
    );`);
    currentDbVersion = 16;
  }

  if (currentDbVersion < 17) {
    console.log("Migrate DB version 17");
    await Notifications.cancelAllScheduledNotificationsAsync();

    currentDbVersion = 17;
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
