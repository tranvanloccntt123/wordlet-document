import axios from "axios";
import * as FileSystem from "expo-file-system";
import { unzipWithPassword } from "react-native-zip-archive";

// Directory for storing downloaded and unzipped files
const DICT_DIR = `${FileSystem.documentDirectory}dicts/`;
export const DB_DIR = `${FileSystem.documentDirectory}SQLite/`;

// Ensure directories exist
async function ensureDirectories() {
  await FileSystem.makeDirectoryAsync(DICT_DIR, { intermediates: true });
  await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });
}

// Download and process a single dictionary
async function downloadDictionary(dict: any) {
  const { download_url, zip_name, unzip_name, data_name } = dict;

  // Skip if no download URL (e.g., Laban Dictionary has empty URL)
  if (!download_url) {
    return;
  }

  const zipPath = `${DICT_DIR}${zip_name}`;
  const unzipPath = `${DICT_DIR}${unzip_name}`;
  const dbPath = `${DB_DIR}${data_name}`;

  try {
    // Download the zip file
    await FileSystem.downloadAsync(download_url, zipPath);

    const listFiles = await FileSystem.readDirectoryAsync(DICT_DIR);

    // Unzip the file
    await unzipWithPassword(
      zipPath,
      DICT_DIR,
      "j[F)SpD{QDFr4SG&Kp;,<C;&CTf9X<"
    );

    await FileSystem.moveAsync({
      from: unzipPath,
      to: dbPath,
    });

    // await FileSystem.deleteAsync(zipPath);
  } catch (error) {
    console.error(`Error processing ${zip_name}:`, error);
  }
}

// Download all Eng-Vie dictionaries
export async function downloadEngVieDictionaries(isMtb = true) {
  try {
    // Ensure directories exist
    await ensureDirectories();
    const direction = await axios.get(
      "https://dl.dict.laban.vn/dict_store/dicts.json"
    );
    // Filter for Eng-Vie dictionaries
    const engVieItem = direction.data.items.filter((item: any) =>
      ["Eng-Vie", "Vie-Eng"].includes(item.type_name_en)
    );

    if (!engVieItem) {
      return;
    }

    // Process each dictionary
    for (const item of engVieItem || []) {
      for (const dict of item.dicts) {
        if (isMtb && !dict.data_name.includes("mtb")) {
          continue;
        }
        await downloadDictionary(dict);
      }
    }
  } catch (error) {
    console.error("Error downloading dictionaries:", error);
  }
}
