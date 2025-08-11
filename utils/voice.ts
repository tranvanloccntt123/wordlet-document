import { PRO_DIC_EV } from "@/constants";
import * as Speech from "expo-speech";

export const stopWord = () => {
  Speech.stop();
};

export const playWord = async (
  word: string,
  source: string,
  rate: number = 1.0
) => {
  await Speech.stop();

  return new Promise((resolve, reject) => {
    Speech.speak(word, {
      language: PRO_DIC_EV.find((v) => v.source === source) ? "en-US" : "vi-VN",
      rate: rate,
      onDone() {
        resolve(true);
      },
      onError(e) {
        reject(e);
      },
    });
  });
};

//REFACTOR 
interface Position {
  col: number;
  row: number;
}

export const ignoreChar = [".", "!", ",", "'", "’", "?", "-"];

export function getLongestSortedList(positions: Position[]): Position[] {
  if (positions.length === 0) return [];

  // Sort positions by row (ascending) and then by col (ascending)
  const sorted = [...positions].sort((a, b) => {
    if (a.row !== b.row) {
      return a.row - b.row; // Lower row first
    }
    return a.col - b.col; // Lower col first within same row
  });

  // dp[i] stores the length of the longest sequence ending at index i
  const dp: number[] = new Array(sorted.length).fill(1);
  // prev[i] stores the previous index in the longest sequence ending at i
  const prev: number[] = new Array(sorted.length).fill(-1);

  // Find the longest increasing subsequence
  let maxLength = 1;
  let maxIndex = 0;

  for (let i = 1; i < sorted.length; i++) {
    for (let j = 0; j < i; j++) {
      if (sorted[i].col > sorted[j].col && sorted[i].row > sorted[j].row) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          prev[i] = j;
        }
      }
    }
    if (dp[i] > maxLength) {
      maxLength = dp[i];
      maxIndex = i;
    }
  }

  // Reconstruct the longest sequence
  const result: Position[] = [];
  let currentIndex = maxIndex;
  while (currentIndex !== -1) {
    result.push(sorted[currentIndex]);
    currentIndex = prev[currentIndex];
  }

  return result.reverse(); // Reverse to get the sequence in increasing order
}

export const wordTableRoad = (spokenText: string, currentWord: string) => {
  const currentWordLabel = currentWord.replaceAll("-", " ").split(" ");
  const spokenTextLabel = spokenText.replaceAll("-", " ").split(" ");
  const roadTable: {
    feedback: {
      char: string;
      status: "correct" | "incorrect" | "missing" | "nocheck";
    }[];
    percent: number | null;
  }[][] = Array.from({ length: spokenTextLabel.length }, (_, i) =>
    Array.from({ length: currentWordLabel.length }, (_, i) => ({
      feedback: [],
      percent: 0,
    }))
  );
  let tmpList: Position[] = [];
  for (let i = 0; i < roadTable.length; i++) {
    for (let j = 0; j < roadTable[i].length; j++) {
      roadTable[i][j] = checkStatusOfResponse(
        spokenTextLabel[i],
        currentWordLabel[j]
      );
      if (roadTable[i][j].percent !== 0) {
        tmpList.push({ col: j, row: i });
      }
    }
  }

  const finalList = getLongestSortedList(tmpList);

  let feedbackList = currentWordLabel.map((word) => {
    const list = word.split("").map((v) => ({
      char: v,
      status: ignoreChar.includes(v.toLowerCase()) ? "nocheck" : "incorrect",
    }));
    list.push({
      char: " ",
      status: "nocheck",
    });
    return list;
  });

  if (finalList.length) {
    finalList.forEach((i) => {
      feedbackList[i.col] = [
        ...roadTable[i.row][i.col].feedback,
        {
          char: " ",
          status: "nocheck",
        },
      ];
    });
  }

  const list = feedbackList.flatMap((v) => v);

  if (list[list.length - 1].char === " ") list.pop();

  return list as {
    char: string;
    status: "correct" | "incorrect" | "missing" | "nocheck";
  }[];
};

export const getPercent = (
  result: Array<{
    char: string;
    status: "correct" | "incorrect" | "missing" | "nocheck";
  }>
) => {
  return !result.length
    ? null
    : (result.filter((item) => item.status === "correct").length /
        result.filter((i) => i.status !== "nocheck").length) *
        100;
};

export const checkStatusOfResponse = (spokenText: string, currentWord: string) => {
  const result: Array<{
    char: string;
    status: "correct" | "incorrect" | "missing" | "nocheck";
  }> = [];
  if (spokenText === "" || !currentWord) {
    return {
      feedback: result,
      percent: null,
    };
  }

  const spokenArray = spokenText.toLowerCase().split("");
  const targetArray = currentWord.toLowerCase().split("");

  let spokenIndex = 0;

  // Compare characters based on target word
  targetArray.forEach((char, index) => {
    if (ignoreChar.includes(spokenArray[spokenIndex])) {
      spokenIndex += 1;
    }
    if (char === spokenArray[spokenIndex]) {
      result.push({ char: currentWord[index], status: "correct" });
      spokenIndex += 1;
    } else {
      if (ignoreChar.includes(char)) {
        result.push({ char: currentWord[index], status: "nocheck" });
      } else {
        result.push({
          char: currentWord[index],
          status: "incorrect",
        });
        spokenIndex += 1;
      }
    }
  });

  const percent = getPercent(result);

  return {
    feedback: result,
    percent,
  };
};
