/* ========================================
   Pong 游戏 - JavaScript 主逻辑文件
   ======================================== */

/* ========================================
   1. Canvas 和绘制上下文初始化
   ======================================== */
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

/* ========================================
   2. 游戏常量定义
   ======================================== */
const paddleWidth = 10;      // 球拍宽度
const paddleHeight = 80;     // 球拍高度
const ballRadius = 8;        // 球的半径

/* ========================================
   3. 玩家球拍对象 - 左边绿色球拍
   ======================================== */
const playerPaddle = {
    x: 15,                              // X 坐标（距离左边 15px）
    y: canvas.height / 2 - paddleHeight / 2,  // Y 坐标（垂直居中）
    width: paddleWidth,                 // 宽度
    height: paddleHeight,               // 高度
    dy: 0,                              // Y 方向速度
    speed: 6                            // 移动速度
};

/* ========================================
   4. 计算机球拍对象 - 右边红色球拍
   ======================================== */
const computerPaddle = {
    x: canvas.width - paddleWidth - 15, // X 坐标（距离右边 15px）
    y: canvas.height / 2 - paddleHeight / 2,  // Y 坐标（垂直居中）
    width: paddleWidth,                 // 宽度
    height: paddleHeight,               // 高度
    dy: 0,                              // Y 方向速度
    speed: 5                            // 移动速度（比玩家慢）
};

/* ========================================
   5. 球对象 - 黄色球
   ======================================== */
const ball = {
    x: canvas.width / 2,               // 初始 X 坐标（水平中心）
    y: canvas.height / 2,              // 初始 Y 坐标（垂直中心）
    radius: ballRadius,                // 半径
    dx: 4,                             // X 方向速度
    dy: 4                              // Y 方向速度
};

/* ========================================
   6. 游戏状态变量
   ======================================== */
let playerScore = 0;        // 玩家得分
let computerScore = 0;      // 计算机得分
let gameRunning = false;    // 游戏是否运行中

/* ========================================
   7. 键盘输入事件监听
   ======================================== */
const keys = {};

// 按键按下事件
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

// 按键释放事件
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

/* ========================================
   8. 鼠标输入事件监听
   ======================================== */
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // 保持球拍在画布范围内
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        playerPaddle.y = mouseY - paddleHeight / 2;
    }
});

/* ========================================
   9. 开始/暂停按钮事件处理
   ======================================== */
document.getElementById('startBtn').addEventListener('click', () => {
    gameRunning = !gameRunning;
    const btn = document.getElementById('startBtn');
    btn.textContent = gameRunning ? 'Pause Game' : 'Start Game';
});

/* ========================================
   10. 重置按钮事件处理
   ======================================== */
document.getElementById('resetBtn').addEventListener('click', () => {
    playerScore = 0;                                    // 重置玩家得分
    computerScore = 0;                                  // 重置计算机得分
    gameRunning = false;                                // 停止游戏
    document.getElementById('playerScore').textContent = '0';       // 更新显示
    document.getElementById('computerScore').textContent = '0';     // 更新显示
    document.getElementById('startBtn').textContent = 'Start Game';  // 重置按钮文本
    resetBall();                                        // 重置球的位置
});

/* ========================================
   11. 绘制矩形函数 - 用于绘制球拍
   ======================================== */
function drawRect(x, y, width, height, color = '#4ade80') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

/* ========================================
   12. 绘制圆形函数 - 用于绘制球
   ======================================== */
function drawCircle(x, y, radius, color = '#fbbf24') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/* ========================================
   13. 绘制中心线函数
   ======================================== */
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
    ctx.setLineDash([10, 10]);      // 虚线样式
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);            // 恢复实线
}

/* ========================================
   14. 更新玩家球拍位置函数
   ======================================== */
function updatePlayerPaddle() {
    // 按下上方向键，球拍向上移动
    if (keys['ArrowUp']) {
        playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed);
    }
    // 按下下方向键，球拍向下移动
    if (keys['ArrowDown']) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed);
    }
}

/* ========================================
   15. 更新计算机球拍位置函数 - AI 逻辑
   ======================================== */
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;  // 球拍中心
    const ballCenter = ball.y;                                             // 球的中心
    const threshold = 50;                                                  // 反应阈值
    
    // 简单 AI：根据球的位置移动球拍
    if (ballCenter < computerCenter - threshold) {
        // 球在球拍上方，向上移动
        computerPaddle.y = Math.max(0, computerPaddle.y - computerPaddle.speed);
    } else if (ballCenter > computerCenter + threshold) {
        // 球在球拍下方，向下移动
        computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + computerPaddle.speed);
    }
}

/* ========================================
   16. 更新球的位置和碰撞检测函数
   ======================================== */
function updateBall() {
    // 更新球的位置
    ball.x += ball.dx;
    ball.y += ball.dy;

    /* ===== 球与顶部和底部墙壁的碰撞 ===== */
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;  // 反转 Y 方向
        // 防止球穿过墙壁
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    /* ===== 球与玩家球拍的碰撞 ===== */
    if (ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height) {
        ball.dx = -ball.dx;  // 反转 X 方向
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;  // 防止穿过球拍
        
        // 根据球击中球拍的位置添加"旋转"效果
        const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy += deltaY * 0.05;  // 击中球拍顶部则向上，击中底部则向下
    }

    /* ===== 球与计算机球拍的碰撞 ===== */
    if (ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height) {
        ball.dx = -ball.dx;  // 反转 X 方向
        ball.x = computerPaddle.x - ball.radius;  // 防止穿过球拍
        
        // 根据球击中球拍的位置添加"旋转"效果
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy += deltaY * 0.05;
    }

    /* ===== 球超出左边界（玩家失分） ===== */
    if (ball.x - ball.radius < 0) {
        computerScore++;  // 计算机得分
        document.getElementById('computerScore').textContent = computerScore;  // 更新显示
        resetBall();  // 重置球
    }

    /* ===== 球超出右边界（计算机失分） ===== */
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;  // 玩家得分
        document.getElementById('playerScore').textContent = playerScore;  // 更新显示
        resetBall();  // 重置球
    }
}

/* ========================================
   17. 重置球的位置和速度函数
   ======================================== */
function resetBall() {
    ball.x = canvas.width / 2;      // 水平中心
    ball.y = canvas.height / 2;     // 垂直中心
    // 随机方向和初始速度
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;      // 随机左右方向
    ball.dy = (Math.random() - 0.5) * 8;               // 随机上下方向
}

/* ========================================
   18. 绘制游戏画面函数
   ======================================== */
function draw() {
    // 清空画布，绘制黑色背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制中心虚线
    drawCenterLine();

    // 绘制玩家球拍（绿色）
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#4ade80');
    
    // 绘制计算机球拍（红色）
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ef4444');

    // 绘制球（黄色）
    drawCircle(ball.x, ball.y, ball.radius, '#fbbf24');
}

/* ========================================
   19. 主游戏循环函数
   ======================================== */
function gameLoop() {
    // 只有游戏运行时才更新游戏状态
    if (gameRunning) {
        updatePlayerPaddle();      // 更新玩家球拍
        updateComputerPaddle();    // 更新计算机球拍
        updateBall();              // 更新球的位置和检测碰撞
    }

    draw();  // 绘制游戏画面
    requestAnimationFrame(gameLoop);  // 递归调用，形成循环
}

/* ========================================
   20. 启动游戏循环
   ======================================== */
gameLoop();
