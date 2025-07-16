// c_english/utils/stringUtils.ts

/**
 * Calculates the Levenshtein distance between two strings.
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions or substitutions) required to change one word into the other.
 * @param a The first string.
 * @param b The second string.
 * @returns The Levenshtein distance.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

const SPELL_REGEX = /^1#(.*)$/m; // Note the 'm' flag for multiline matching

const getSpellFromContent = (content: string) => {
  const match = content.match(SPELL_REGEX);
  if (match && match[1]) {
    const spellText = match[1];
    return spellText;
  } else {
    return "";
  }
};

export async function calculateSimilarityText(
  original: string,
  spoken: string
): Promise<number> {
  const distance = levenshteinDistance(
    original.toLowerCase().trim(),
    spoken.toLowerCase().trim()
  );
  const maxLength = Math.max(original.length, spoken.length);
  if (maxLength === 0 && distance === 0) return 100; // Both empty and identical
  if (maxLength === 0) return 0; // One is empty, the other is not, or both empty but distance > 0 (should not happen)
  const similarity = (1 - distance / maxLength) * 100;
  return Math.max(0, parseFloat(similarity.toFixed(2))); // Ensure it's not negative and format
}

export async function calculateSimilarityPercentage(
  original: string,
  spoken: string,
  c_word_supabase: WordStore[],
  s_word_supabase: WordStore[]
): Promise<number> {
  const o = original.toLowerCase().trim(); // Normalized original word
  const lenO = o.length;

  const trimmedSpoken = spoken.toLowerCase().trim();
  // Split spoken text into words, filtering out any empty strings that might result from multiple spaces
  const spokenWords = trimmedSpoken
    ? trimmedSpoken.split(" ").filter((word) => word.length > 0)
    : [];

  // If the original word is empty and there are no spoken words, they are 100% similar.
  if (lenO === 0 && spokenWords.length === 0) {
    return 100;
  }

  // If there are no spoken words to compare against (and original might not be empty), similarity is 0.
  if (spokenWords.length === 0) {
    return 0;
  }

  let maxSimilarity = 0.0;

  for (const s_word of spokenWords) {
    const lenS_word = s_word.length;

    // If both original and current spoken word are empty (should be rare after filter if o is also empty)
    if (lenO === 0 && lenS_word === 0) {
      maxSimilarity = Math.max(maxSimilarity, 100);
      continue;
    }
    // If either original or current spoken word is empty (but not both), similarity for this pair is 0
    if (lenO === 0 || lenS_word === 0) {
      maxSimilarity = Math.max(maxSimilarity, 0);
      continue;
    }

    const distance = levenshteinDistance(o, s_word);
    const avgLength = (lenO + lenS_word) / 2.0;
    const similarityValue = (1 - distance / avgLength) * 100;
    const currentSimilarity = Math.max(
      0,
      parseFloat(similarityValue.toFixed(2))
    );
    let spellSimilarity = 0;
    if (currentSimilarity < 100) {
      const origin_store = c_word_supabase?.find(
        (w) => w.word === o.toLowerCase()
      );

      const s_store = s_word_supabase?.find(
        (w) => w.word === s_word.toLowerCase()
      );
      if (origin_store && s_store) {
        const origin_spell = getSpellFromContent(origin_store.content);
        const s_spell = getSpellFromContent(s_store.content);
        spellSimilarity = await calculateSimilarityText(origin_spell, s_spell);
      }
    }
    maxSimilarity = Math.max(maxSimilarity, currentSimilarity, spellSimilarity);
  }

  return maxSimilarity;
}

export const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getOwnerGroupKey = (serieId?: number) => `OWNER_GROUP_${serieId}`;

export const getGroupKey = (groupId: number): string => `GROUP_${groupId}`;

export const getSearchKey = (key: string): string => `SEARCH_${key}`;

export const getWordKey = (key: string): string => `WORD_${key}`;

export const getCurrentRankKey = (): string => `CURRENT_RANK`;

export const getTop100PlayersKey = (): string => `TOP_100_PLAYERS`;

export const getReportOnGroupKey = (groupId: number): string =>
  `REPORT_GROUP_${groupId}`;

export const getOwnerSeriesKey = () => `OWNER_SERIES`;

export const getSerieDetailKey = (seriesId: number) => `SERIES_${seriesId}`;

export const getGroupsInSeries = (seriesId: number) =>
  `SERIES_GROUP_${seriesId}`;
