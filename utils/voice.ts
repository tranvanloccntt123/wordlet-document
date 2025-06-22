import { PRO_DIC_EV } from "@/constants";
import * as Speech from "expo-speech";

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
