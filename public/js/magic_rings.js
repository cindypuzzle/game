document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');

    const ringsContainer = document.getElementById('rings-container');
    const messageElement = document.getElementById('message');
    const hintButton = document.getElementById('hint-button');
    const restartButton = document.getElementById('restart-button');
    let rings = [];
    let selectedRings = [];
    let chainedRings = [];
    let targetSum = 0;
    let selectionOrder = 0; // 添加这个变量来跟踪选择顺序

    let startTime;
    let attempts = 0;
    let highScore = localStorage.getItem('magicRingsHighScore') || 0;

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

        console.log('New target sum:', targetSum);
        console.log('Chained rings:', chainedRings);
        console.log('Chained rings sums:', chainedRings.map(ring => ring.reduce((a, b) => a + b, 0)));

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
        let targetSum = Math.floor(Math.random() * 31) + 40; // 生成40到70之间的随机目标和

        console.log('Target sum:', targetSum);

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
                    newRing[j] = Math.floor(Math.random() * 10);
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
                currentRing[adjustIndex] = Math.max(0, Math.min(9, currentRing[adjustIndex] - diff));
            }
        }

        // 检查是否满足条件
        if (checkAdjacentNumbers(rings) && rings.every(ring => ring.reduce((a, b) => a + b, 0) === targetSum)) {
            return rings;
        }

        return null;
    }

    function generateRingNumbers(targetSum) {
        const numbers = [];
        let remainingSum = targetSum;

        for (let i = 0; i < 10; i++) {
            if (i === 9) {
                numbers.push(remainingSum);
            } else {
                const maxNumber = Math.min(9, remainingSum - (9 - i));
                const minNumber = Math.max(0, remainingSum - (9 * (9 - i)));
                const number = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
                numbers.push(number);
                remainingSum -= number;
            }
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
            
            console.log(`Checking ring ${i} and ${(i + 1) % 4}:`);
            console.log(`  Ring ${i}: ${currentRing}`);
            console.log(`  Ring ${(i + 1) % 4}: ${nextRing}`);
            console.log(`  ${currentRing[4]} === ${nextRing[0]} && ${currentRing[5]} === ${nextRing[9]}`);
            
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
            const angle = (i * 36 - 90 + 18) * Math.PI / 180; // 从12点钟方向开始，+18度使数字位于扇形中间
            const radius = 50; // 调整半径使数字更靠近圆环中心
            const x = 75 + radius * Math.cos(angle);
            const y = 75 + radius * Math.sin(angle);
            number.style.left = `${x}px`;
            number.style.top = `${y}px`;
            ring.appendChild(number);
        }

        // 添加顺序数字显示
        const orderNumber = document.createElement('div');
        orderNumber.className = 'order-number';
        orderNumber.style.display = 'none'; // 初始时隐藏
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
            const endTime = new Date();
            const timeTaken = (endTime - startTime) / 1000; // 转换为秒
            const score = calculateScore(timeTaken, attempts);
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('magicRingsHighScore', highScore);
            }

            showMessage(`恭喜你！你找到了正确的四环！\n用时：${timeTaken.toFixed(2)}秒\n尝试次数：${attempts}\n得分：${score}`, 'success');
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

    function calculateScore(time, attempts) {
        // 基础分数为10000
        let score = 10000;
        // 每秒扣除10分
        score -= Math.floor(time) * 10;
        // 每次尝试扣除100分
        score -= (attempts - 1) * 100;
        // 确保分数不为负
        return Math.max(score, 0);
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

    function showHint() {
        const unselectedTargetRings = chainedRings.filter(ring => 
            !selectedRings.some(selectedRing => selectedRing.numbers.every((num, index) => num === ring[index]))
        );

        if (unselectedTargetRings.length > 0) {
            const hintRing = unselectedTargetRings[0];
            const hintElement = rings.find(ring => ring.numbers.every((num, index) => num === hintRing[index])).element;
            hintElement.classList.add('hint');
            setTimeout(() => hintElement.classList.remove('hint'), 2000);
        }

        messageElement.textContent = `提示：目标和为 ${targetSum}。寻找首尾相连的圆环。`;
        messageElement.className = 'hint';

        // 使用淡出效果
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = '';
            }, 500); // 等待淡出动画完成
        }, 4500); // 4.5秒后开始淡出
    }

    // 初始化游戏
    createRings();
    updateScoreDisplay();

    // 添加提示按钮事件监听器
    hintButton.addEventListener('click', showHint);

    // 添加重新开始按钮事件监听器
    if (restartButton) {
        console.log('Restart button found');
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            createRings();
            messageElement.textContent = '';
            messageElement.className = '';
            console.log('Game restarted');
        });
    } else {
        console.error('Restart button not found');
    }
});