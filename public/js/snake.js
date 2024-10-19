const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10},
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let gameSpeed = 200;

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
}

function clearCanvas() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        generateFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    // 绘制蛇身
    snake.forEach((segment, index) => {
        if (index === 0) {
            drawSnakeHead(segment);
        } else {
            drawSnakeBody(segment, index);
        }
    });
}

function drawSnakeHead(head) {
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.ellipse(
        (head.x + 0.5) * gridSize,
        (head.y + 0.5) * gridSize,
        gridSize / 2,
        gridSize / 3,
        0,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // 绘制眼睛
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc((head.x + 0.3) * gridSize, (head.y + 0.3) * gridSize, gridSize / 10, 0, 2 * Math.PI);
    ctx.arc((head.x + 0.7) * gridSize, (head.y + 0.3) * gridSize, gridSize / 10, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制瞳孔
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc((head.x + 0.3) * gridSize, (head.y + 0.3) * gridSize, gridSize / 20, 0, 2 * Math.PI);
    ctx.arc((head.x + 0.7) * gridSize, (head.y + 0.3) * gridSize, gridSize / 20, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSnakeBody(segment, index) {
    const gradient = ctx.createRadialGradient(
        (segment.x + 0.5) * gridSize,
        (segment.y + 0.5) * gridSize,
        0,
        (segment.x + 0.5) * gridSize,
        (segment.y + 0.5) * gridSize,
        gridSize / 2
    );
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#2E7D32');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
        (segment.x + 0.5) * gridSize,
        (segment.y + 0.5) * gridSize,
        gridSize / 2.5,
        gridSize / 3,
        0,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // 添加鳞片效果
    if (index % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.ellipse(
            (segment.x + 0.5) * gridSize,
            (segment.y + 0.5) * gridSize,
            gridSize / 4,
            gridSize / 5,
            0,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

function drawFood() {
    const gradient = ctx.createRadialGradient(
        (food.x + 0.5) * gridSize, (food.y + 0.5) * gridSize, 2,
        (food.x + 0.5) * gridSize, (food.y + 0.5) * gridSize, gridSize / 2
    );
    gradient.addColorStop(0, '#FF5252');
    gradient.addColorStop(1, '#D32F2F');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * gridSize, (food.y + 0.5) * gridSize, gridSize / 2 - 1, 0, 2 * Math.PI);
    ctx.fill();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // 确保食物不会生成在蛇身上
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
}

function checkCollision() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    startButton.disabled = false;
}

function startGame() {
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    dx = 1;
    dy = 0;
    score = 0;
    gameSpeed = 200;
    scoreElement.textContent = score;
    generateFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
    startButton.disabled = true;
}

function increaseSpeed() {
    if (gameSpeed > 100) {
        gameSpeed -= 1;
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, gameSpeed);
    }
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

startButton.addEventListener('click', startGame);

generateFood();
