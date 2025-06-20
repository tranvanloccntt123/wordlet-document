import { SEARCH_LIMIT } from "@/constants";
import { SQLiteDatabase, openDatabaseAsync } from "expo-sqlite";

export const fetchHistoryResults = async (
  db: SQLiteDatabase,
  afterById?: number | null // Optional: if null/undefined, fetches the most recent records
): Promise<GameHistory[]> => {
  try {
    let query = `SELECT id, score, date, message FROM history`;
    const params: any[] = [];

    if (afterById !== null && afterById !== undefined) {
      query += ` WHERE id > ?`;
      params.push(afterById);
    }

    query += ` ORDER BY id ASC LIMIT ?`;
    params.push(SEARCH_LIMIT);

    const results = await db.getAllAsync<GameHistory>(query, ...params);
    return results || []; // Ensure an array is always returned
  } catch (error) {
    console.error("Error fetching history results:", error);
    return []; // Return empty on error to allow fallback or indicate failure
  }
};

/**
 * Inserts a new record into the history table.
 * @param db The SQLiteDatabase instance.
 * @param recordData The history record data to insert (score, date, message).
 * @returns Promise<GameHistory | null> The newly added GameHistory record with its ID, or null on failure.
 */
export const addHistoryRecord = async (
  recordData: Omit<GameHistory, "id">
): Promise<GameHistory | null> => {
  try {
    const db = await openDatabaseAsync("teiresource.db", {
      useNewConnection: true,
    });

    const query = `
      INSERT INTO history (score, date, message)
      VALUES (?, ?, ?);
    `;
    const result = await db.runAsync(
      query,
      recordData.score,
      recordData.created_at,
      recordData.message
    );
    if (result.changes > 0 && result.lastInsertRowId) {
      // Construct the full GameHistory object with the new ID
      return {
        id: result.lastInsertRowId,
        ...recordData,
      };
    }
    return null; // Insertion failed or ID not retrieved
  } catch (error) {
    console.error("Error inserting history record:", error);
    return null; // Indicate failure
  }
};
