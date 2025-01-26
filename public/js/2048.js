document.addEventListener('DOMContentLoaded', () => {
    const GRID_SIZE = 4;
    const CELL_COUNT = GRID_SIZE * GRID_SIZE;
    let score = 0;
    let grid = [];
    
    // 初始化游戏
    function initGame() {
        const gameGrid = document.querySelector('.grid');
        // 清空网格
        gameGrid.innerHTML = '';
        
        // 创建单元格
        for (let i = 0; i < CELL_COUNT; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const content = document.createElement('div');
            content.classList.add('cell-content');
            cell.appendChild(content);
            gameGrid.appendChild(cell);
        }
        
        // 初始化数据网格
        grid = new Array(GRID_SIZE).fill(null)
            .map(() => new Array(GRID_SIZE).fill(0));
            
        // 添加两个初始数字
        addNewNumber();
        addNewNumber();
        
        // 更新显示
        updateDisplay();
    }
    
    // 添加新数字
    function addNewNumber() {
        const emptyCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    // 更新显示
    function updateDisplay() {
        const cells = document.querySelectorAll('.cell-content');
        let index = 0;
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const value = grid[i][j];
                const cell = cells[index];
                cell.textContent = value || '';
                cell.className = 'cell-content' + (value ? ` n${value}` : '');
                index++;
            }
        }
        
        // 更新分数
        document.querySelector('.score strong').textContent = score;
    }
    
    // 移动处理
    function move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(grid);
        
        switch(direction) {
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
        }
        
        if (moved) {
            addNewNumber();
            updateDisplay();
            
            if (isGameOver()) {
                alert('游戏结束！最终得分：' + score);
            }
        }
    }
    
    // 向左移动
    function moveLeft() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const row = grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(GRID_SIZE - row.length).fill(0));
            if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            grid[i] = newRow;
        }
        return moved;
    }
    
    // 向右移动
    function moveRight() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const row = grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            const newRow = Array(GRID_SIZE - row.length).fill(0).concat(row);
            if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            grid[i] = newRow;
        }
        return moved;
    }
    
    // 向上移动
    function moveUp() {
        let moved = false;
        for (let j = 0; j < GRID_SIZE; j++) {
            const column = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            const newColumn = column.concat(Array(GRID_SIZE - column.length).fill(0));
            for (let i = 0; i < GRID_SIZE; i++) {
                if (grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    // 向下移动
    function moveDown() {
        let moved = false;
        for (let j = 0; j < GRID_SIZE; j++) {
            const column = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            const newColumn = Array(GRID_SIZE - column.length).fill(0).concat(column);
            for (let i = 0; i < GRID_SIZE; i++) {
                if (grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    // 检查游戏是否结束
    function isGameOver() {
        // 检查是否有空格
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (grid[i][j] === 0) return false;
            }
        }
        
        // 检查是否有相邻的相同数字
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return false;
                if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return false;
            }
        }
        
        return true;
    }
    
    // 键盘事件监听
    document.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            move(event.key);
        }
    });
    
    // 初始化游戏
    initGame();
});
