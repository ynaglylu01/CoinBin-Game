// =========================================================
// 1. 获取 HTML 元素与常量定义
// =========================================================
const coin = document.getElementById('coin');
const coinFace = document.getElementById('coin-face');
const flipButton = document.getElementById('flip-button');
const resultDisplay = document.getElementById('result');
const resultContainer = document.getElementById('result-container'); // 假设你为结果显示创建了容器，如果没有就只用 resultDisplay

const HEADS = 0;
const TAILS = 1;
const headImgSrc = 'coin_head.png';
const tailImgSrc = 'coin_tail.png';

// 计时变量
let pressStartTime = 0;
let animationTimeoutId = null;

// 抛出参数
const MAX_PRESS_TIME = 2000; // 最大有效按压时间：2000毫秒 (2秒)
const MAX_FLIGHT_HEIGHT = 400; // 最大抛出高度 (CSS 像素值)
const MIN_FLIGHT_HEIGHT = 150; // 最小抛出高度

// =========================================================
// 2. 核心函数：按下、松开与动画
// =========================================================

/**
 * 鼠标按下事件：开始计时
 */
function handlePressStart() {
    // 如果硬币正在抛掷，则忽略
    if (flipButton.disabled) return;
    
    // 记录按下时间
    pressStartTime = Date.now();
    resultDisplay.textContent = '蓄力中...';
    // 移除之前的动画，准备新的抛掷
    coin.classList.remove('is-flipping');
}

/**
 * 鼠标松开事件：计算高度并开始动画
 */
function handlePressEnd() {
    // 如果没有按下或正在动画，则忽略
    if (pressStartTime === 0 || flipButton.disabled) return;

    // 禁用按钮，开始动画流程
    flipButton.disabled = true;
    resultDisplay.textContent = '抛掷中...';
    
    // 1. 计算按压时长 (确保不超过最大值)
    const pressDuration = Math.min(Date.now() - pressStartTime, MAX_PRESS_TIME);
    
    // 2. 将按压时长映射到抛出高度
    // 归一化时长：0 到 1 之间
    const normalizedDuration = pressDuration / MAX_PRESS_TIME;
    // 线性映射到高度范围：MIN_HEIGHT 到 MAX_HEIGHT
    const flightHeight = MIN_FLIGHT_HEIGHT + (MAX_FLIGHT_HEIGHT - MIN_FLIGHT_HEIGHT) * normalizedDuration;
    
    // 3. 计算总动画时间 (高度越高，时间越长)
    // 使用一个简单的比例：每增加 100px 高度，增加 0.5 秒时间
    const timeMultiplier = (flightHeight - MIN_FLIGHT_HEIGHT) / 100;
    const baseDuration = 2000; // 最低高度时的基础时间 (2秒)
    const totalDuration = baseDuration + timeMultiplier * 500; // 500毫秒 (0.5秒)
    
    // 4. 动态创建或更新 CSS 动画
    updateCoinAnimation(flightHeight, totalDuration);

    // 5. 触发动画
    // 确保重绘，让动画能重复播放
    void coin.offsetWidth;
    coin.classList.add('is-flipping');

    // 6. 设定结果判定计时器
    const finalResult = Math.floor(Math.random() * 2);

    animationTimeoutId = setTimeout(() => {
        // 动画结束，判定结果
        coin.classList.remove('is-flipping');

        // 显示最终面
        if (finalResult === HEADS) {
            coinFace.src = headImgSrc;
            resultDisplay.textContent = '结果：正面！';
        } else {
            coinFace.src = tailImgSrc;
            resultDisplay.textContent = '结果：反面！';
        }

        flipButton.disabled = false;
        pressStartTime = 0; // 重置计时
    }, totalDuration);
}


/**
 * 动态修改 CSS 动画的函数
 * @param {number} height - 抛出的最大高度
 * @param {number} duration - 动画总时长 (毫秒)
 */
function updateCoinAnimation(height, duration) {
    const style = document.createElement('style');
    style.type = 'text/css';
    
    // 硬币绕 X 轴的总旋转圈数 (圈数越多，时间越长，模拟更随机)
    const totalTurns = Math.floor(duration / 500) * 360; // 假设每 0.5s 至少旋转一圈
    
    const keyframes = `
        @keyframes dynamicToss {
            0% { 
                transform: translateY(0) rotateX(0deg); 
            }
            50% { 
                /* 使用计算出的高度 */
                transform: translateY(-${height}px) rotateX(${totalTurns / 2}deg); 
            }
            100% { 
                /* 落地时的总旋转度数 */
                transform: translateY(0) rotateX(${totalTurns}deg); 
            }
        }
        
        .is-flipping {
            /* 应用新的动画名称和时长 */
            animation: dynamicToss ${duration / 1000}s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }
    `;
    
    // 移除旧的动态样式，避免重复
    const oldStyle = document.getElementById('dynamic-coin-style');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    style.innerHTML = keyframes;
    style.id = 'dynamic-coin-style';
    document.head.appendChild(style);
}

// =========================================================
// 3. 事件监听 (改为按下/松开)
// =========================================================
// 鼠标按下事件 (兼容PC和手机)
flipButton.addEventListener('mousedown', handlePressStart);
flipButton.addEventListener('touchstart', handlePressStart);

// 鼠标松开事件 (兼容PC和手机)
flipButton.addEventListener('mouseup', handlePressEnd);
flipButton.addEventListener('touchend', handlePressEnd);
// =========================================================
// 4. 解决手机长按弹出菜单问题的代码
// =========================================================

// 监听硬币按钮上的 contextmenu 事件
flipButton.addEventListener('contextmenu', function(e) {
    // 阻止浏览器的默认行为，即阻止弹出“复制、搜索”等菜单
    e.preventDefault();
});


// 建议：如果用户长按页面其他区域也会中断，可以监听整个游戏容器
const gameContainer = document.querySelector('.game-container');
if (gameContainer) {
    gameContainer.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
}