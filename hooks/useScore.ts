import React, { useRef } from "react";

export const useScore = () => {
  const questionStartTimeRef = useRef<number | null>(null);
  const correctNumber = React.useRef<number>(0);
  const score = React.useRef<number>(0);

  const calculateScore = (rate: number = 1) => {
    "worklet";
    if (questionStartTimeRef.current !== null) {
      const timeTakenMs = Date.now() - questionStartTimeRef.current;
      const seconds = timeTakenMs / 1000;
      score.current =
        score.current +
        (seconds < 10
          ? 100
          : seconds < 20
          ? 70
          : seconds < 40
          ? 50
          : seconds < 60
          ? 30
          : 10) *
          rate;
      // You can store this timeTakenMs if you need it for scoring or display later
    }
    correctNumber.current = correctNumber.current + 1;
    return { score: score.current / 100, correctNumber: correctNumber.current };
  };

  const nextScore = () => {
    questionStartTimeRef.current = Date.now(); // Record start time for the new question
  };

  return {
    correctNumber: correctNumber.current,
    score: score.current,
    calculateScore,
    nextScore,
  };
};

export const useSpeakAndCompareScore = (total: number) => {
  const score = React.useRef(Array.from({ length: total }, (_, i) => 0));
  const calculateScore = (index: number, percent: number = 0) => {
    score.current[index] = percent;
  };
  return {
    calculateScore,
    score: score.current,
  };
};
