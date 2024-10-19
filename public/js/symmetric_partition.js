console.log('对称分区游戏脚本开始加载');

const boardSize = 5; // 5x5的游戏板
const colors = ['red', 'blue', 'green'];
let selectedColor = null;
let board = [];

function initializeGame() {
    console.log('初始化游戏开始...');
    if (!document.getElementById('game-board')) {
        console.error('找不到游戏板元素');
        return;
    }
    if (!document.getElementById('color-palette')) {
        console.error('找不到颜色选择板元素');
        return;
    }
    if (!document.getElementById('check-solution')) {
        console.error('找不到检查解决方案按钮');
        return;
    }
    generateBoard();
    renderBoard();
    createColorPalette();
    document.getElementById('check-solution').addEventListener('click', checkSolution);
    console.log('初始化游戏完成');
}

function generateBoard() {
    console.log('开始生成游戏板');
    board = Array(boardSize).fill().map(() => Array(boardSize).fill().map(() => ({ color: null, isBlackDot: false })));
    
    // 固定的黑点位置
    const blackDots = [
        {x: 1, y: 1},
        {x: 2, y: 3},
        {x: 3, y: 2}
    ];
    
    blackDots.forEach(dot => {
        board[dot.x][dot.y].isBlackDot = true;
    });
    
    console.log('游戏板生成完成');
}

function renderBoard() {
    console.log('开始渲染游戏板');
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => colorCell(i, j));
            if (board[i][j].isBlackDot) {
                const blackDot = document.createElement('div');
                blackDot.className = 'black-dot';
                cell.appendChild(blackDot);
            }
            gameBoard.appendChild(cell);
        }
    }

    console.log('游戏板渲染完成');
}

function createColorPalette() {
    console.log('开始创建颜色选择板');
    const colorPalette = document.getElementById('color-palette');
    colors.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.className = 'color-button';
        colorButton.style.backgroundColor = color;
        colorButton.addEventListener('click', () => selectColor(color));
        colorPalette.appendChild(colorButton);
    });
    console.log('颜色选择板创建完成');
}

function selectColor(color) {
    console.log(`选择颜色: ${color}`);
    selectedColor = color;
    document.querySelectorAll('.color-button').forEach(button => {
        button.classList.remove('selected');
        if (button.style.backgroundColor === color) {
            button.classList.add('selected');
        }
    });
}

function colorCell(row, col) {
    console.log(`尝试为单元格 (${row}, ${col}) 上色`);
    if (selectedColor && !board[row][col].isBlackDot) {
        board[row][col].color = selectedColor;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.style.backgroundColor = selectedColor;
        cell.classList.add('colored');
        console.log(`单元格 (${row}, ${col}) 已上色为 ${selectedColor}`);
    } else if (board[row][col].isBlackDot) {
        console.log('无法为黑点上色');
    } else {
        console.log('未选择颜色');
    }
}

function checkSolution() {
    console.log('开始检查解决方案');
    const message = document.getElementById('message');
    if (isSolutionValid()) {
        message.textContent = "恭喜！你成功解决了这个难题！";
        console.log('解决方案正确');
    } else {
        message.textContent = "解决方案不正确，请继续尝试。";
        console.log('解决方案不正确');
    }
}

function isSolutionValid() {
    const coloredAreas = new Set();
    
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j].isBlackDot) {
                if (!isSymmetricCenter(i, j)) {
                    console.log(`黑点 (${i}, ${j}) 不是对称中心`);
                    return false;
                }
                coloredAreas.add(board[i][j].color);
            } else if (!board[i][j].color) {
                console.log(`格子 (${i}, ${j}) 没有颜色`);
                return false;
            }
        }
    }
    
    return coloredAreas.size === 3;  // 确保有3个不同的颜色区域
}

function isSymmetricCenter(row, col) {
    const color = board[row][col].color;
    if (!color) {
        console.log(`黑点 (${row}, ${col}) 没有颜色`);
        return false;
    }

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const x = row + i;
            const y = col + j;
            if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
                const oppositeX = row - i;
                const oppositeY = col - j;
                if (oppositeX >= 0 && oppositeX < boardSize && oppositeY >= 0 && oppositeY < boardSize) {
                    if (board[x][y].color !== color || board[oppositeX][oppositeY].color !== color) {
                        console.log(`颜色 ${color} 的单元格 (${x}, ${y}) 和 (${oppositeX}, ${oppositeY}) 不对称`);
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

window.onload = initializeGame;

console.log('对称分区游戏脚本加载完成');