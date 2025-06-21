const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const grid = 20;
let snake, dx, dy, food, delay, level, levelProgress, maxLevel = 15;
let walls = [];
let score = 0;
let paused = false;
let count = 0;

function startGame() {
  const difficulty = document.getElementById("levelSelect").value;
  snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
  ];
  dx = grid;
  dy = 0;
  level = 1;
  levelProgress = 0;
  delay = 1000;
  score = 0;
  count = 0;
  paused = false;
  walls = [];

  setupWalls(difficulty);
  food = placeFood();
  updateProgressBar();
  requestAnimationFrame(gameLoop);
}

function setupWalls(difficulty) {
  walls = [];
  if (difficulty === "medium") {
    for (let x = 0; x < canvas.width; x += grid) {
      walls.push({ x, y: 0 });
      walls.push({ x, y: canvas.height - grid });
    }
  } else if (difficulty === "hard") {
    for (let x = 0; x < canvas.width; x += grid) {
      walls.push({ x, y: 0 });
      walls.push({ x, y: canvas.height - grid });
    }
    for (let y = 0; y < canvas.height; y += grid) {
      walls.push({ x: 0, y });
      walls.push({ x: canvas.width - grid, y });
    }
  }
}

function placeFood() {
  let x, y;
  do {
    x = Math.floor(Math.random() * (canvas.width / grid)) * grid;
    y = Math.floor(Math.random() * (canvas.height / grid)) * grid;
  } while (
    snake.some(s => s.x === x && s.y === y) ||
    walls.some(w => w.x === x && w.y === y)
  );
  return { x, y };
}

function gameLoop() {
  if (paused) return;

  setTimeout(() => {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (checkCollision(head)) {
      alert(`Game Over! Final level: ${level}`);
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      levelProgress++;
      score++;
      updateProgressBar();
      if (levelProgress >= 30) {
        level++;
        levelProgress = 0;
        delay = Math.max(100, delay - 100);
        if (level > maxLevel) {
          alert("🎉 You completed all levels!");
          return;
        }
      }
      food = placeFood();
    } else {
      snake.pop();
    }

    drawGame();
    requestAnimationFrame(gameLoop);
  }, delay);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  snake.forEach(part => {
    ctx.beginPath();
    ctx.arc(part.x + grid / 2, part.y + grid / 2, grid / 2.4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + grid / 2, food.y + grid / 2, grid / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "gray";
  walls.forEach(w => ctx.fillRect(w.x, w.y, grid, grid));
}

function checkCollision(head) {
  const difficulty = document.getElementById("levelSelect").value;
  if (difficulty !== "easy") {
    if (
      head.x < 0 || head.x >= canvas.width ||
      head.y < 0 || head.y >= canvas.height
    ) return true;
  }
  if (snake.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) return true;
  if (walls.some(w => w.x === head.x && w.y === head.y)) return true;
  return false;
}

function updateProgressBar() {
  const progress = (levelProgress / 30) * 100;
  document.getElementById("progressBar").style.width = `${progress}%";
}

function pauseGame() {
  paused = !paused;
  if (!paused) requestAnimationFrame(gameLoop);
}

function setDirection(dir) {
  if (dir === "up" && dy === 0) { dx = 0; dy = -grid; }
  else if (dir === "down" && dy === 0) { dx = 0; dy = grid; }
  else if (dir === "left" && dx === 0) { dx = -grid; dy = 0; }
  else if (dir === "right" && dx === 0) { dx = grid; dy = 0; }
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") setDirection("up");
  else if (e.key === "ArrowDown") setDirection("down");
  else if (e.key === "ArrowLeft") setDirection("left");
  else if (e.key === "ArrowRight") setDirection("right");
  else if (e.key === " " || e.key === "Enter") pauseGame();
});