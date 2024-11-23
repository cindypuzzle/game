document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score-value');
    const newGameButton = document.getElementById('new-game');
    let board = [];
    let score = 0;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // 确定滑动方向的最小距离（像素）
        const minDistance = 30;
        
        // 判断滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (Math.abs(deltaX) > minDistance) {
                if (deltaX > 0) {
                    move('ArrowRight');
                } else {
                    move('ArrowLeft');
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(deltaY) > minDistance) {
                if (deltaY > 0) {
                    move('ArrowDown');
                } else {
                    move('ArrowUp');
                }
            }
        }
    });

    // 阻止页面滚动
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    function initGame() {
        board = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        addNewTile();
        addNewTile();
        updateBoard();
    }

    function addNewTile() {
        let emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function updateBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.textContent = board[i][j] || '';
                if (board[i][j]) {
                    tile.style.backgroundColor = getTileColor(board[i][j]);
                }
                gameBoard.appendChild(tile);
            }
        }
        scoreDisplay.textContent = score;
    }

    function getTileColor(value) {
        const colors = {
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        return colors[value] || '#3c3a32';
    }

    function move(direction) {
        let moved = false;
        const directionMap = {
            'ArrowUp': {i: -1, j: 0},
            'ArrowDown': {i: 1, j: 0},
            'ArrowLeft': {i: 0, j: -1},
            'ArrowRight': {i: 0, j: 1}
        };
        const {i: di, j: dj} = directionMap[direction];

        // 首先,移动所有方块
        for (let i = di > 0 ? 3 : 0; i >= 0 && i < 4; i += di > 0 ? -1 : 1) {
            for (let j = dj > 0 ? 3 : 0; j >= 0 && j < 4; j += dj > 0 ? -1 : 1) {
                if (board[i][j] !== 0) {
                    let [ni, nj] = [i, j];
                    while (true) {
                        let [nexti, nextj] = [ni + di, nj + dj];
                        if (nexti < 0 || nexti >= 4 || nextj < 0 || nextj >= 4 || board[nexti][nextj] !== 0) {
                            break;
                        }
                        [ni, nj] = [nexti, nextj];
                    }
                    if (ni !== i || nj !== j) {
                        board[ni][nj] = board[i][j];
                        board[i][j] = 0;
                        moved = true;
                    }
                }
            }
        }

        // 然后,合并相同的方块
        for (let i = di > 0 ? 3 : 0; i >= 0 && i < 4; i += di > 0 ? -1 : 1) {
            for (let j = dj > 0 ? 3 : 0; j >= 0 && j < 4; j += dj > 0 ? -1 : 1) {
                if (board[i][j] !== 0) {
                    let [ni, nj] = [i + di, j + dj];
                    if (ni >= 0 && ni < 4 && nj >= 0 && nj < 4 && board[ni][nj] === board[i][j]) {
                        board[ni][nj] *= 2;
                        score += board[ni][nj];
                        board[i][j] = 0;
                        moved = true;
                    }
                }
            }
        }

        // 最后,再次移动所有方块以填补空缺
        for (let i = di > 0 ? 3 : 0; i >= 0 && i < 4; i += di > 0 ? -1 : 1) {
            for (let j = dj > 0 ? 3 : 0; j >= 0 && j < 4; j += dj > 0 ? -1 : 1) {
                if (board[i][j] !== 0) {
                    let [ni, nj] = [i, j];
                    while (true) {
                        let [nexti, nextj] = [ni + di, nj + dj];
                        if (nexti < 0 || nexti >= 4 || nextj < 0 || nextj >= 4 || board[nexti][nextj] !== 0) {
                            break;
                        }
                        [ni, nj] = [nexti, nextj];
                    }
                    if (ni !== i || nj !== j) {
                        board[ni][nj] = board[i][j];
                        board[i][j] = 0;
                        moved = true;
                    }
                }
            }
        }

        if (moved) {
            addNewTile();
            updateBoard();
            if (isGameOver()) {
                alert("游戏结束！您的得分是: " + score);
            }
        }
    }

    function isGameOver() {
        // 检查是否还有空格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    return false;
                }
            }
        }
        // 检查是否还有可以合并的相邻方块
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (
                    (i < 3 && board[i][j] === board[i + 1][j]) ||
                    (j < 3 && board[i][j] === board[i][j + 1])
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            move(e.key);
        }
    });

    newGameButton.addEventListener('click', initGame);

    initGame();
});
