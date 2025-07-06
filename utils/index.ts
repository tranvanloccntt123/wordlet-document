export const delay = async (ms: number = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
};

const deleteZerosAfterDot = (score: string) => {
  return score.replace(/\.?0+$/, "");
};

export const formatScore = (score: number): string => {
  if (score >= 1000000000) {
    return `${deleteZerosAfterDot((score / 1000000000).toFixed(2))}B+`;
  }
  if (score >= 1000000) {
    return `${deleteZerosAfterDot((score / 1000000).toFixed(2))}M+`;
  }
  if (score >= 1000) {
    // Handles 1k, 10k, 100k
    return `${deleteZerosAfterDot((score / 1000).toFixed(2))}k+`;
  }
  return score.toString();
};
