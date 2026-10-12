import { questions } from "./questions.js";
import { getHighScore, saveHighScore } from "./storage.js";

const quiz = document.querySelector("#quiz");
const screen = document.querySelector("#screen");
const highScoreEl = document.querySelector("#highScore");
const progress = document.querySelector("#progress");
const progressBar = document.querySelector("#progressBar");

const state = { deck: [], current: 0, correct: 0, answered: false };

const el = (tag, { text = "", className = "", data = {} } = {}) => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  Object.entries(data).forEach(([key, value]) => (node.dataset[key] = value));
  return node;
};

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const calcScore = () => Math.round((state.correct / state.deck.length) * 100);

const getMessage = (score) => {
  if (score >= 90) return "Luar biasa! Kamu menguasai materinya.";
  if (score >= 70) return "Bagus! Sedikit lagi sempurna.";
  if (score >= 50) return "Lumayan, yuk belajar lagi.";
  return "Jangan menyerah, coba lagi!";
};

const updateHighScore = () => {
  highScoreEl.textContent = getHighScore();
};

const updateProgress = () => {
  progress.hidden = false;
  progressBar.style.width = `${(state.current / state.deck.length) * 100}%`;
};

const renderStart = () => {
  progress.hidden = true;
  screen.replaceChildren(
    el("p", { text: `Jawab ${questions.length} soal pemrograman dan lihat skormu!`, className: "quiz__intro" }),
    el("button", { text: "Mulai", className: "btn", data: { action: "start" } })
  );
};

const renderQuestion = () => {
  const { question, options } = state.deck[state.current];
  state.answered = false;
  updateProgress();

  const list = el("div", { className: "options" });
  options.forEach((option, index) => {
    list.append(el("button", { text: option, className: "option", data: { index } }));
  });

  screen.replaceChildren(
    el("p", { text: `Soal ${state.current + 1} / ${state.deck.length}`, className: "quiz__progress" }),
    el("h2", { text: question, className: "quiz__question" }),
    list
  );
};

const renderResult = () => {
  const score = calcScore();
  const isNewRecord = saveHighScore(score);
  updateHighScore();
  progressBar.style.width = "100%";

  screen.replaceChildren(
    el("h2", { text: "Quiz Selesai!" }),
    el("p", { text: `Benar ${state.correct} dari ${state.deck.length}`, className: "quiz__intro" }),
    el("p", { text: String(score), className: "quiz__score" }),
    el("p", { text: getMessage(score), className: "quiz__intro" }),
    ...(isNewRecord ? [el("p", { text: "🎉 High score baru!", className: "quiz__badge" })] : []),
    el("button", { text: "Main Lagi", className: "btn", data: { action: "restart" } })
  );
};

const startQuiz = () => {
  Object.assign(state, { deck: shuffle(questions), current: 0, correct: 0, answered: false });
  renderQuestion();
};

const selectAnswer = (button) => {
  if (state.answered) return;
  state.answered = true;

  const chosen = Number(button.dataset.index);
  const { answer } = state.deck[state.current];
  const isCorrect = chosen === answer;

  if (isCorrect) state.correct++;

  screen.querySelectorAll(".option").forEach((option, index) => {
    option.disabled = true;
    if (index === answer) option.classList.add("correct");
  });
  if (!isCorrect) button.classList.add("wrong");

  const isLast = state.current === state.deck.length - 1;
  screen.append(
    el("button", {
      text: isLast ? "Lihat Hasil" : "Soal Berikutnya",
      className: "btn",
      data: { action: "next" },
    })
  );
};

const nextStep = () => {
  state.current++;
  state.current < state.deck.length ? renderQuestion() : renderResult();
};

const actions = { start: startQuiz, restart: startQuiz, next: nextStep };

// Event delegation: satu listener untuk semua tombol
quiz.addEventListener("click", (event) => {
  const actionBtn = event.target.closest("[data-action]");
  if (actionBtn) {
    actions[actionBtn.dataset.action]?.();
    return;
  }
  const optionBtn = event.target.closest(".option");
  if (optionBtn) selectAnswer(optionBtn);
});

updateHighScore();
renderStart();
