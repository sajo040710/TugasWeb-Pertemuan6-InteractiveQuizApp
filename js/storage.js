const KEY = "quiz-high-score";

export const getHighScore = () => {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
};

export const saveHighScore = (score) => {
  try {
    if (score > getHighScore()) {
      localStorage.setItem(KEY, String(score));
      return true;
    }
  } catch {
    // storage tidak tersedia, abaikan
  }
  return false;
};
