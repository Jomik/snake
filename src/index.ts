import * as _ from "lodash";

type Point = { x: number; y: number };

const MAP_SIZE = 30;
const SNAKE_SIZE = 5;
const SQUARE_SIZE = 15;

let snake: Point[];
let speed = 10;
let nextDirection: Point | undefined = undefined;
let direction: Point = { x: 1, y: 0 };
let dead = false;
let food: Point;

const container = document.getElementById("container")!;
const score = document.getElementById("score")!;
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!;

function tick() {
  if (!dead) {
    updateDirection();
    const head = snake[0];
    const next = { x: head.x + direction.x, y: head.y + direction.y };
    checkCollision(next);
    if (!dead) {
      moveSnake(next);
    }
  }

  clearCanvas();
  drawFood();
  drawSnake();
}

function updateScore() {
  score.innerText = `Score: ${snake.length - SNAKE_SIZE}`;
}

function placeFood() {
  food = { x: _.random(MAP_SIZE - 1), y: _.random(MAP_SIZE - 1) };
}

function checkCollision(next: Point) {
  const { x, y } = next;
  if (
    x < 0 ||
    x >= MAP_SIZE ||
    y < 0 ||
    y >= MAP_SIZE ||
    _.tail(snake).some(p => p.x === x && p.y === y)
  ) {
    dead = true;
  } else if (x === food.x && y === food.y) {
    placeFood();
    snake.push({ x: -1, y: -1 });
    updateScore();
  }
}

function moveSnake(next: Point) {
  snake.pop();
  snake.unshift(next);
}

function controls(key: string) {
  switch (key) {
    case "ArrowDown":
    case "r":
      if (direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
      }
      break;
    case "ArrowUp":
    case "w":
      if (direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
      }
      break;
    case "ArrowLeft":
    case "a":
      if (direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
      }
      break;
    case "ArrowRight":
    case "s":
      if (direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
      }
      break;
    case " ":
      if (dead) {
        dead = false;
        nextDirection = { x: 1, y: 0 };
        resetSnake();
      }
  }
}
document.addEventListener("keydown", event => {
  if (event.defaultPrevented) {
    return;
  }
  controls(event.key);
});

function updateDirection() {
  if (nextDirection !== undefined) {
    direction = nextDirection;
    nextDirection = undefined;
  }
}

function drawSnake() {
  drawSquare(snake[0], dead ? "red" : "yellow");
  _.tail(snake).forEach(
    _.chain(drawSquare)
      .partialRight(dead ? "darkred" : "lightgreen")
      .unary()
      .value()
  );
}

function drawFood() {
  drawCircle(food, "red");
}

function clearCanvas() {
  context.fillStyle = "white";
  context.strokeStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawCircle({ x, y }: Point, fill: string, stroke: string = "black") {
  context.beginPath();
  context.fillStyle = fill;
  context.strokeStyle = stroke;
  context.arc(
    SQUARE_SIZE * x + SQUARE_SIZE / 2,
    SQUARE_SIZE * y + SQUARE_SIZE / 2,
    SQUARE_SIZE / 2,
    0,
    2 * Math.PI
  );
  context.closePath();
  context.fill();
  context.stroke();
}

function drawSquare({ x, y }: Point, fill: string, stroke: string = "black") {
  context.fillStyle = fill;
  context.strokeStyle = stroke;
  context.fillRect(SQUARE_SIZE * x, SQUARE_SIZE * y, SQUARE_SIZE, SQUARE_SIZE);
  context.strokeRect(
    SQUARE_SIZE * x,
    SQUARE_SIZE * y,
    SQUARE_SIZE,
    SQUARE_SIZE
  );
}

function resetSnake() {
  snake = _.rangeRight(SNAKE_SIZE).map(i => ({
    x: i + MAP_SIZE / 2 - 1 - SNAKE_SIZE,
    y: MAP_SIZE / 2
  }));
  updateScore();
}

canvas.width = canvas.height = SQUARE_SIZE * MAP_SIZE;
container.appendChild(canvas);

let last = 0;
function loop(now: number) {
  if (last < now - 1000 / speed) {
    tick();
    last = now;
  }
  requestAnimationFrame(loop);
}
resetSnake();
placeFood();
loop(0);
// tick();
