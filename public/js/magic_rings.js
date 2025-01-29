document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

    const ringsContainer = document.getElementById('rings-container');
    const messageElement = document.getElementById('message');
    const hintButton = document.getElementById('hint-button');
    const restartButton = document.getElementById('restart-button');
    const startOverlay = document.getElementById('start-overlay');
    const startGameBtn = document.getElementById('start-game-btn');
    const gameContainer = document.getElementById('game-container');
    
    let rings = [];
    let selectedRings = [];
    let chainedRings = [];
    let targetSum = 0;
    let selectionOrder = 0; // 添加这个变量来跟踪选择顺序

    let startTime;
    let attempts = 0;
    let highScore = localStorage.getItem('magicRingsHighScore') || 0;

    let timerInterval;
    let startTimeStamp;  // 使用时间戳来计算精确时间
    let timerElement;

    timerElement = document.getElementById('timer');

    let currentDifficulty = 'medium'; // 默认中级难度

    // 添加难度选择按钮的事件监听
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const difficultyDesc = document.querySelector('.difficulty-desc');
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按钮状态
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新当前难度
            currentDifficulty = btn.dataset.difficulty;
            
            // 更新描述文本
            difficultyDesc.textContent = currentDifficulty === 'easy' ? 
                '初级：数字范围 1-9' : '中级：数字范围 10-30';
        });
    });

    // 初始加载时就创建游戏
    createRings();
    updateScoreDisplay();

    // 修改开始游戏按钮的事件监听
    startGameBtn.addEventListener('click', async () => {
        try {
            // 修改为正确的路径
            const response = await fetch(`/game/magic-rings/average-time?game_name=magic_rings&level=${currentDifficulty}`);
            if (!response.ok) {
                throw new Error('获取平均用时失败');
            }
            const data = await response.json();
            
            // 更新平均用时显示
            if (data.avg_time !== null) {
                updateAverageTimeDisplay(data.avg_time);
            } else {
                updateAverageTimeDisplay(null);
            }

            // 继续原有的开始游戏逻辑
            startOverlay.style.display = 'none';
            createRings();
            startTimer();
        } catch (error) {
            console.error('获取平均用时时发生错误:', error);
            // 即使获取平均用时失败，也继续开始游戏
            startOverlay.style.display = 'none';
            createRings();
            startTimer();
        }
    });

    // 修改重新开始按钮的处理
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            stopTimer();
            createRings(); // 重新创建游戏
            startOverlay.style.display = 'flex';
            messageElement.textContent = '';
            messageElement.className = '';
        });
    }

    // 修改 createRings 函数，移除自动开始计时的部分
    function createRings() {
        console.log('Creating rings');
        ringsContainer.innerHTML = '';
        rings = [];
        selectedRings = [];
        messageElement.textContent = '';
        messageElement.className = '';

        const [allRings, newTargetSum, newChainedRings] = generateValidRings();
        targetSum = newTargetSum;
        chainedRings = newChainedRings;

        allRings.forEach((numbers, id) => {
            const ring = createRing(id, numbers);
            rings.push(ring);
            ringsContainer.appendChild(ring.element);
        });
        selectionOrder = 0;

        startTime = new Date();
        attempts = 0;
        updateScoreDisplay();
    }

    function generateValidRings() {
        const allRings = [];
        let chainedRings = null;
        // 根据难度调整目标和
        let targetSum = currentDifficulty === 'easy' ? 
            Math.floor(Math.random() * 31) + 40 : // 初级：40-70
            Math.floor(Math.random() * 51) + 150;  // 中级：150-200

        console.log('Target sum:', targetSum);
        console.log('Current difficulty:', currentDifficulty);

        // 生成四个符合条件的目标圆环
        while (!chainedRings) {
            chainedRings = generateChainedRings(targetSum);
        }

        // 将目标圆环添加到所有圆环中
        allRings.push(...chainedRings);

        // 生成额外的链接圆环（干扰项）
        const extraChainedRings = generateExtraChainedRings(chainedRings, 3); // 生成3个额外的链接圆环
        allRings.push(...extraChainedRings);

        // 生成剩余的圆环
        while (allRings.length < 10) {
            const ring = generateRingNumbers(targetSum);
            allRings.push(ring);
        }

        // 打乱圆环顺序
        shuffleArray(allRings);

        return [allRings, targetSum, chainedRings];
    }

    function generateExtraChainedRings(baseChainedRings, count) {
        const extraRings = [];
        for (let i = 0; i < count; i++) {
            const baseRing = baseChainedRings[Math.floor(Math.random() * baseChainedRings.length)];
            const newRing = [...baseRing];
            
            // 随机修改一些数字，但保持首尾相连的特性
            for (let j = 0; j < 8; j++) {
                if (j !== 0 && j !== 4 && j !== 5 && j !== 9) {
                    // 根据难度生成对应范围的随机数
                    newRing[j] = currentDifficulty === 'easy' ? 
                        Math.floor(Math.random() * 9) + 1 :  // 初级：1-9
                        Math.floor(Math.random() * 21) + 10; // 中级：10-30
                }
            }
            
            extraRings.push(newRing);
        }
        return extraRings;
    }

    function generateChainedRings(targetSum) {
        const rings = [];
        for (let i = 0; i < 4; i++) {
            const ring = generateRingNumbers(targetSum);
            rings.push(ring);
        }

        // 确保圆环可以首尾相连
        for (let i = 0; i < 4; i++) {
            const currentRing = rings[i];
            const nextRing = rings[(i + 1) % 4];
            const temp4 = currentRing[4];
            const temp5 = currentRing[5];
            currentRing[4] = nextRing[0];
            currentRing[5] = nextRing[9];
            // 调整总和
            const diff = (currentRing[4] + currentRing[5]) - (temp4 + temp5);
            if (diff !== 0) {
                const adjustIndex = Math.floor(Math.random() * 8); // 0-7
                const minNum = currentDifficulty === 'easy' ? 1 : 10;
                const maxNum = currentDifficulty === 'easy' ? 9 : 30;
                currentRing[adjustIndex] = Math.max(minNum, Math.min(maxNum, currentRing[adjustIndex] - diff));
            }
        }

        // 检查是否满足条件
        if (checkAdjacentNumbers(rings) && rings.every(ring => {
            const sum = ring.reduce((a, b) => a + b, 0);
            const allNumbersInRange = ring.every(num => 
                currentDifficulty === 'easy' ? 
                    (num >= 1 && num <= 9) : 
                    (num >= 10 && num <= 30)
            );
            return sum === targetSum && allNumbersInRange;
        })) {
            return rings;
        }

        return null;
    }

    function generateRingNumbers(targetSum) {
        const numbers = [];
        let remainingSum = targetSum;

        // 根据难度设置数字范围
        const minNum = currentDifficulty === 'easy' ? 1 : 10;
        const maxNum = currentDifficulty === 'easy' ? 9 : 30;
        
        // 调整目标和的范围
        if (currentDifficulty === 'easy' && targetSum > 90) {
            targetSum = Math.floor(Math.random() * 31) + 40; // 40-70之间
            remainingSum = targetSum;
        }

        for (let i = 0; i < 10; i++) {
            if (i === 9) {
                if (remainingSum < minNum || remainingSum > maxNum) {
                    return generateRingNumbers(targetSum);
                }
                numbers.push(remainingSum);
            } else {
                const maxNumber = Math.min(maxNum, remainingSum - (minNum * (9 - i)));
                const minNumber = Math.max(minNum, remainingSum - (maxNum * (9 - i)));
                
                if (maxNumber < minNumber) {
                    return generateRingNumbers(targetSum);
                }
                
                const number = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
                numbers.push(number);
                remainingSum -= number;
            }
        }

        if (numbers.some(num => num < minNum || num > maxNum)) {
            return generateRingNumbers(targetSum);
        }

        shuffleArray(numbers);
        return numbers;
    }

    function checkAdjacentNumbers(rings) {
        if (!Array.isArray(rings) || rings.length !== 4) {
            console.error('Invalid rings array passed to checkAdjacentNumbers');
            return false;
        }

        for (let i = 0; i < 4; i++) {
            const currentRing = Array.isArray(rings[i]) ? rings[i] : rings[i].numbers;
            const nextRing = Array.isArray(rings[(i + 1) % 4]) ? rings[(i + 1) % 4] : rings[(i + 1) % 4].numbers;
                        
            if (currentRing[4] !== nextRing[0] || currentRing[5] !== nextRing[9]) {
                return false;
            }
        }
        return true;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createRing(id, numbers) {
        const ring = document.createElement('div');
        ring.className = 'ring';
        ring.dataset.id = id;

        // 添加十等分扇形，从12点钟方向开始
        for (let i = 0; i < 10; i++) {
            const segment = document.createElement('div');
            segment.className = 'ring-segment';
            segment.style.transform = `rotate(${i * 36 - 90}deg) skew(54deg)`;
            ring.appendChild(segment);

            // 添加数字
            const number = document.createElement('div');
            number.className = 'ring-number';
            number.textContent = numbers[i];
            
            // 修改数字位置计算
            // 将角度偏移18度（36/2），使数字位于扇形中间
            const angle = ((i * 36) + 18) * (Math.PI / 180); 
            const radius = 65; // 调整半径，使数字位于圆环的合适位置
            const x = 90 + radius * Math.sin(angle);
            const y = 90 - radius * Math.cos(angle);
            
            number.style.left = `${x}px`;
            number.style.top = `${y}px`;
            ring.appendChild(number);
        }

        // 添加顺序数字显示
        const orderNumber = document.createElement('div');
        orderNumber.className = 'order-number';
        orderNumber.style.display = 'none';
        ring.appendChild(orderNumber);

        ring.addEventListener('click', () => toggleRingSelection(ring));
        return { element: ring, numbers };
    }

    function toggleRingSelection(ring) {
        const index = selectedRings.findIndex(r => r.element === ring);
        const orderNumber = ring.querySelector('.order-number');
        
        if (index === -1) {
            if (selectedRings.length < 4) {
                selectedRings.push(rings.find(r => r.element === ring));
                ring.classList.add('selected');
                ring.style.animation = 'none';
                ring.offsetHeight; // 触发重绘
                ring.style.animation = null;
                selectionOrder++;
                orderNumber.textContent = selectionOrder;
                orderNumber.style.display = 'flex';
                orderNumber.style.opacity = '0';
                setTimeout(() => {
                    orderNumber.style.opacity = '1';
                }, 50);
            }
        } else {
            selectedRings.splice(index, 1);
            ring.classList.remove('selected');
            orderNumber.style.opacity = '0';
            setTimeout(() => {
                orderNumber.style.display = 'none';
            }, 300);
            // 重新调整剩余选中圆环的顺序
            updateSelectionOrder();
        }

        if (selectedRings.length === 4) {
            checkSolution();
        }
    }

    function updateSelectionOrder() {
        selectionOrder = 0;
        selectedRings.forEach((ring, index) => {
            selectionOrder++;
            const orderNumber = ring.element.querySelector('.order-number');
            orderNumber.textContent = selectionOrder;
        });
    }

    function checkSolution() {
        attempts++;
        if (selectedRings.length !== 4) {
            showMessage('请选择四个圆环。', 'error');
            return;
        }

        const isCorrectChain = checkAdjacentNumbers(selectedRings);
        const sums = selectedRings.map(ring => ring.numbers.reduce((a, b) => a + b, 0));
        const isEqualSum = sums.every(sum => sum === targetSum);

        console.log('Selected rings:', selectedRings.map(ring => ring.numbers));
        console.log('Sums:', sums);
        console.log('Target sum:', targetSum);
        console.log('Is equal sum:', isEqualSum);
        console.log('Is correct chain:', isCorrectChain);

        if (isCorrectChain && isEqualSum) {
            const totalTime = stopTimer();  // 获取总用时（毫秒）
            const score = calculateScore(totalTime, attempts);
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('magicRingsHighScore', highScore);
            }

            // 先调用 celebrateSuccess，确保记录保存
            celebrateSuccess();

            // 然后显示成功消息
            showMessage(`恭喜你！你找到了正确的四环！\n用时：${formatTime(totalTime)}\n尝试次数：${attempts}\n得分：${score}`, 'success');
            updateScoreDisplay();
        } else {
            let errorMessage = '很遗憾，这不是正确的组合。';
            if (!isCorrectChain) {
                errorMessage += ' 圆环之间的连接不正确。';
            }
            if (!isEqualSum) {
                errorMessage += ' 圆环的数字之和不等于目标值。';
            }
            showMessage(errorMessage, 'error');
        }
    }

    function calculateScore(timeInMs, attempts) {
        // 确保参数都是数字
        timeInMs = Number(timeInMs);
        attempts = Number(attempts);
        
        // 基础分数为10000
        let score = 10000;
        
        // 每秒扣除10分（使用毫秒计算）
        score -= Math.floor(timeInMs / 1000) * 10;
        
        // 每次尝试扣除100分（从第二次尝试开始算）
        score -= (attempts - 1) * 100;
        
        // 确保分数不为负，且为整数
        return Math.max(0, Math.floor(score));
    }

    function updateScoreDisplay() {
        const scoreElement = document.getElementById('score-display');
        if (scoreElement) {
            scoreElement.textContent = `最高分：${highScore}`;
        }
    }

    function showMessage(text, className) {
        messageElement.textContent = text;
        messageElement.className = className;
        messageElement.classList.add('fade-in');

        setTimeout(() => {
            messageElement.classList.remove('fade-in');
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = '';
                messageElement.classList.remove('fade-out');
            }, 500);
        }, 4500);
    }

    // 修改计时器相关函数
    function startTimer() {
        timerElement = document.getElementById('timer');
        startTimeStamp = Date.now();  // 记录开始时间戳
        
        // 清除可能存在的旧计时器
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // 启动新计时器，每10毫秒更新一次
        timerInterval = setInterval(() => {
            updateTimerDisplay();
        }, 10);  // 设置为10毫秒更新一次
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        return Date.now() - startTimeStamp;  // 返回总用时（毫秒）
    }

    function updateTimerDisplay() {
        const elapsedTime = Date.now() - startTimeStamp;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);  // 取前两位
        
        timerElement.textContent = `时间：${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    }

    // 修改时间格式化函数
    function formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const ms = Math.floor((milliseconds % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }

    // 修改 celebrateSuccess 函数
    function celebrateSuccess() {
        // 获取游戏数据用于保存记录
        const timeSpent = Date.now() - startTimeStamp;
        const score = calculateScore(timeSpent, attempts);
        const level = currentDifficulty;

        console.log('准备保存游戏记录:', {
            timeSpent,
            score,
            level,
            startTimeStamp,
            attempts
        });

        // 保存游戏记录
        saveGameRecord(score, timeSpent, level)
            .then(() => console.log('游戏记录保存成功'))
            .catch(err => console.error('保存游戏记录失败:', err));

        // 显示成功标题
        const successTitle = document.getElementById('success-title');
        successTitle.classList.add('show');
        setTimeout(() => {
            successTitle.classList.remove('show');
        }, 2000);

        // 发射礼花
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        // 创建密集的礼花效果
        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            // 随机位置发射礼花
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
            });
        }, 50);

        // 添加中间爆发效果
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });

        // 添加螺旋效果
        const end = Date.now() + (1 * 1000);
        const colors = ['#ff0000', '#00ff00', '#0000ff'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    // 修改 updateAverageTimeDisplay 函数
    function updateAverageTimeDisplay(avgTime) {
        const avgTimeElement = document.getElementById('avg-time-display');
        if (avgTimeElement) {
            if (avgTime === null) {
                avgTimeElement.textContent = `最近10局平均用时：--:--`;
            } else {
                avgTimeElement.textContent = `最近10局平均用时：${formatTime(avgTime)}`;
            }
        }
    }

    // 修改 saveGameRecord 函数
    async function saveGameRecord(score, timeSpent, level) {
        const recordData = {
            game_name: 'magic_rings',
            score: score,
            time_spent: timeSpent,
            level: level,
        };
        
        console.log('准备发送的记录数据:', recordData);
        
        try {
            const response = await fetch('/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recordData)
            });

            console.log('API响应状态:', response.status);
            
            if (response.status === 401) {
                alert('请先登录后再保存记录');
                window.location.href = '/auth/login';
                return;
            }
            
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage;
                
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error;
                } else {
                    errorMessage = await response.text();
                }
                
                console.error('API错误详情:', errorMessage);
                throw new Error(`保存记录失败: ${response.status} ${errorMessage}`);
            }

            const data = await response.json();
            
            // 只有当 avg_time_last_10 存在且不为 null 时才更新显示
            if (data.hasOwnProperty('avg_time_last_10')) {
                updateAverageTimeDisplay(data.avg_time_last_10);
            } else {
                updateAverageTimeDisplay(null);
            }
            
            return data;
        } catch (error) {
            console.error('保存记录时发生错误:', error);
            console.error('错误堆栈:', error.stack);
            throw error;
        }
    }
});