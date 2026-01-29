const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const overlay = document.getElementById("overlay");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let direction;
let nextDirection;
let food;
let obstacles;
let score;
let bestScore = Number(localStorage.getItem("snakeBest")) || 0;
let isRunning = false;
let isPaused = false;
let speed = Number(speedRange.value);
let loopId;
let combo = 0;

bestScoreEl.textContent = bestScore;

const sounds = {
  eat: new Audio("data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAAwAEABAAZGF0YQAAAAA="),
};

const randomCell = () => ({
  x: Math.floor(Math.random() * tileCount),
  y: Math.floor(Math.random() * tileCount),
});

const cellsEqual = (a, b) => a.x === b.x && a.y === b.y;

const resetGame = () => {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  food = randomCell();
  obstacles = [];
  score = 0;
  combo = 0;
  scoreEl.textContent = score;
  placeFood();
};

const placeFood = () => {
  let candidate = randomCell();
  while (
    snake.some(segment => cellsEqual(segment, candidate)) ||
    obstacles.some(obstacle => cellsEqual(obstacle, candidate))
  ) {
    candidate = randomCell();
  }
  food = candidate;
};

const drawCell = (cell, color, glow = false) => {
  ctx.fillStyle = color;
  ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
  if (glow) {
    ctx.strokeStyle = "rgba(246, 216, 107, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(cell.x * gridSize + 2, cell.y * gridSize + 2, gridSize - 4, gridSize - 4);
  }
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  obstacles.forEach(obstacle => drawCell(obstacle, "#3a2b00"));

  snake.forEach((segment, index) => {
    const isHead = index === 0;
    drawCell(segment, isHead ? "#f6d86b" : "#b58c2e", isHead);
  });

  drawCell(food, "#ff6b6b", true);
};

const update = () => {
  if (!isRunning || isPaused) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = snake.some(segment => cellsEqual(segment, head));
  const hitObstacle = obstacles.some(obstacle => cellsEqual(obstacle, head));

  if (hitWall || hitSelf || hitObstacle) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (cellsEqual(head, food)) {
    const bonus = combo >= 3 ? 2 : 1;
    score += 1 + bonus;
    combo += 1;
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem("snakeBest", String(bestScore));
    }
    if (score % 5 === 0) {
      addObstacle();
    }
    placeFood();
    playSound("eat");
  } else {
    snake.pop();
    combo = 0;
  }

  draw();
};

const addObstacle = () => {
  let candidate = randomCell();
  while (
    snake.some(segment => cellsEqual(segment, candidate)) ||
    obstacles.some(obstacle => cellsEqual(obstacle, candidate)) ||
    cellsEqual(candidate, food)
  ) {
    candidate = randomCell();
  }
  obstacles.push(candidate);
};

const playSound = name => {
  const sound = sounds[name];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
};

const gameLoop = () => {
  clearInterval(loopId);
  loopId = setInterval(update, 1000 / speed);
};

const startGame = () => {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;
  overlay.classList.add("hidden");
  statusTitle.textContent = "Игра идет";
  statusText.textContent = "Собирай монеты и избегай преград.";
  gameLoop();
  draw();
};

const pauseGame = () => {
  if (!isRunning) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶️ Продолжить" : "⏸ Пауза";
  overlay.classList.toggle("hidden", !isPaused);
  statusTitle.textContent = isPaused ? "Пауза" : "Игра идет";
  statusText.textContent = isPaused
    ? "Нажми продолжить, чтобы вернуться в игру."
    : "Собирай монеты и избегай преград.";
};

const endGame = () => {
  isRunning = false;
  isPaused = false;
  clearInterval(loopId);
  overlay.classList.remove("hidden");
  statusTitle.textContent = "Игра окончена";
  statusText.textContent = `Счет: ${score}. Нажми старт, чтобы сыграть снова.`;
  startBtn.textContent = "🔁 Еще раз";
};

const resetAll = () => {
  clearInterval(loopId);
  isRunning = false;
  isPaused = false;
  pauseBtn.textContent = "⏸ Пауза";
  startBtn.textContent = "▶️ Старт";
  overlay.classList.remove("hidden");
  statusTitle.textContent = "Нажми старт";
  statusText.textContent = "Управление: стрелки или WASD.";
  resetGame();
  draw();
};

const handleKey = event => {
  const key = event.key.toLowerCase();
  const directionMap = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const chosen = directionMap[key];
  if (!chosen) return;

  if (direction.x + chosen.x === 0 && direction.y + chosen.y === 0) {
    return;
  }

  nextDirection = chosen;
};

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    resetGame();
    startBtn.textContent = "▶️ Старт";
    startGame();
  }
});

pauseBtn.addEventListener("click", pauseGame);
resetBtn.addEventListener("click", resetAll);

speedRange.addEventListener("input", event => {
  speed = Number(event.target.value);
  if (isRunning) {
    gameLoop();
  }
});

window.addEventListener("keydown", handleKey);

resetAll();
