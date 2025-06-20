
export interface ParsedWordContent {
  partOfSpeech?: string;
  definition?: string;
  examples: Array<{ sentence: string; translation?: string }>;
}

export const parseWordContent = (content: string): ParsedWordContent => {
  const lines = content.split("\n");
  const result: ParsedWordContent = { examples: [] };

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("1#")) {
      result.partOfSpeech = trimmedLine.substring(2).trim();
    } else if (trimmedLine.startsWith("5#")) {
      result.definition = trimmedLine.substring(2).trim();
    } else if (
      trimmedLine.startsWith("2#") ||
      trimmedLine.startsWith("3#") ||
      trimmedLine.startsWith("4#")
    ) {
      const exampleContent = trimmedLine.substring(2).trim();
      const [sentence, translation] = exampleContent
        .split("//")
        .map((s) => s.trim());
      if (sentence) {
        result.examples.push({ sentence, translation: translation || undefined });
      }
    }
  });

  return result;
};
