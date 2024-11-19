const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreboardDiv = document.getElementById('scoreboard');
const currentScoreDiv = document.getElementById('currentScore');
const startScreen = document.getElementById('startScreen');
const waitingScreen = document.getElementById('waitingScreen');
const startBtn = document.getElementById('startBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const ws = new WebSocket('wss://fanzy.club:8080');
// Second WebSocket connection for incrementing score because ESP update it everytime it sends a message
const wsForIncrement = new WebSocket('wss://ballcatch.glitch.me');

const BALL_SIZE = 20;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 10;
const GOLDEN_BALL_INTERVAL = 5000;
const GOLDEN_BALL_SCORE = 5;
const WINNING_SCORE = 300;
const MAX_SHIP_SPEED = 10;

const winSound = document.getElementById('winSound');
const gameOverSound = document.getElementById('gameOverSound');
const music1 = document.getElementById('music1');
const redBallSound = document.getElementById('redBallSound');
const goldenBallSound = document.getElementById('goldenBallSound');
const whiteBallSound = document.getElementById('whiteBallSound');
const titleMusic = document.getElementById('titleMusic');

let winSoundPlayed = false;
let gameOverSoundPlayed = false;

let ballSpeed = 3.0;
let secondBallSpeedMultiplier = 0.4;
let goldenBallSpeedMultiplier = 1.5;
let ballX, ballY, ballSpeedY, ballSpeedX;
let secondBalls = [];
let goldenBallX, goldenBallY, goldenBallSpeedX, goldenBallSpeedY, goldenBallActive = false;
let platformX, platformY;
let isGameOver = false;
let score = 0;
let playerName = '';
let ballColor = '#ffffff';
let secondBallColor = '#ff0000';
let goldenBallColor = '#ffd700';
let bgColor = '#000000';
let imgX = 2;
let imgSpeed = 3;
let imgSpeedMultiplier = 1.1;
let secondBallCounter = 0;
let originalImgSpeed = imgSpeed;
let maxBallSpeed = 3;
let maxImgSpeed = 8;
let teleport = false;
let teleportInterval;
let playerControlled = false;
let musicStarted = false;
let I = 0;
let ready = false;

let ready1 = false;
let ready2 = false;
let option3 = false;

const scoreboard = [];

// Load images
const img = new Image();
const platformImg = new Image();
const gameOverImg = new Image();
const bgImg1 = new Image();
const bgImg2 = new Image();
let currentImgSrc = 'assets/ship.png';
let currentBgImg = null;

img.src = currentImgSrc;
platformImg.src = 'assets/platform.png';
gameOverImg.src = 'assets/gameOver.png';
bgImg1.src = 'assets/backgroundGame1.png';
bgImg2.src = 'assets/backgroundGame2.png';


function resetBall() {
    ballX = imgX;
    ballY = 0;
    ballSpeedY = ballSpeed * 0.3;
    ballSpeedX = Math.max((Math.random() + 1.1) * 1.6, 1.7) * 1.3;
}

function resetSecondBalls() {
    secondBalls = [];
    for (let i = 0; i < 2; i++) {
        secondBalls.push({
            x: imgX,
            y: 0,
            speedY: ballSpeed * 0.2,
            speedX: (Math.random() - 0.5) * 0.5
        });
    }
}

function moreSecondBalls() {
    for (let i = 0; i < 4; i++) {
        secondBalls.push({
            x: imgX,
            y: 0,
            speedY: ballSpeed * 0.3,
            speedX: (Math.random() + 1.1) * 1.1
        });
    }
}


function resetGoldenBall() {
    goldenBallX = imgX;
    goldenBallY = -30;
    goldenBallSpeedY = ballSpeed * goldenBallSpeedMultiplier * 0.3;
    goldenBallSpeedX = Math.max((Math.random() + 1.1) * 1.6, 1.7) * goldenBallSpeedMultiplier;
    goldenBallActive = true;
}

function resetPlatform() {
    platformX = (canvas.width - PLATFORM_WIDTH) / 2;
    platformY = canvas.height - PLATFORM_HEIGHT - 10;
}

function resetGame() {
    ballSpeed = 2.5;
    imgSpeed = originalImgSpeed * 0.5;
    score = 0;
    secondBallCounter = 0;
    goldenBallActive = false;
    resetBall();
    resetPlatform();
    isGameOver = false;
    currentScoreDiv.innerText = `Score: ${score}`;
    resetGoldenBall();
}

function drawBall(x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform() {
    ctx.drawImage(platformImg, platformX, platformY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
}

function drawGameOver() {
    gameOverScreen.style.display = 'flex';
    gameOverScreen.querySelector('p').innerText = `${playerName},`;
    gameOverScreen.querySelector('p1').innerText = `du konntest leider nur ${score} Punkt(e) erzielen!`;
    music1.pause();
    if (!gameOverSoundPlayed) {
        gameOverSound.play();
        gameOverSoundPlayed = true;
    }
}

function drawWinScreen() {
    winScreen.style.display = 'flex';
    winScreen.querySelector('p').innerText = `Glückwunsch, ${playerName}!`;
    winScreen.querySelector('p1').innerText = `Du konntest ${score} Punkte erzielen!`;
    music1.pause();
    if (!winSoundPlayed) {
        winSound.play();
        winSoundPlayed = true;
    }
}

function updateScoreboard() {
    scoreboardDiv.innerHTML = '<h2>Scoreboard</h2><ol>' +
        scoreboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('') +
        '</ol>';
}

function restartGame() {
    location.reload();
}

function decrement() {
    wsForIncrement.send(JSON.stringify({
        type: 'action',
        content: 'decrement'
    }));
}

function incrementWhite() {
    wsForIncrement.send(JSON.stringify({
        type: 'action',
        content: 'incrementWhite'
    }));
}

function incrementGold() {
    wsForIncrement.send(JSON.stringify({
        type: 'action',
        content: 'incrementGold'
    }));
}

startBtn.addEventListener('click', () => {
    music1.pause();
    titleMusic.play();
    ready = true;
    startBtn.style.display = 'none';
    qrCodePage1.style.display = 'flex';
    startScreen.style.display = 'none';
});

function update() {
    if (isGameOver) return;

    ballY += ballSpeedY;
    ballX += ballSpeedX;
    goldenBallX += goldenBallSpeedX;
    goldenBallY += goldenBallSpeedY;

    secondBalls.forEach((ball, index) => {
        ball.y += ball.speedY;
        ball.x += ball.speedX;

        if (ball.x <= 0 || ball.x >= canvas.width - BALL_SIZE) {
            ball.speedX = -ball.speedX;
        }

        if (ball.y + BALL_SIZE >= platformY && ball.x >= platformX && ball.x <= platformX + PLATFORM_WIDTH) {
            score -= 10;
            redBallSound.play();
            decrement();
            currentScoreDiv.innerText = `Score: ${score}`;
            secondBalls.splice(index, 1);

            if (score < 0) {
                endGame();
                return;
            }
        } else if (ball.y > canvas.height) {
            secondBalls.splice(index, 1);
        }
    });

    if (goldenBallActive) {
        if (isBallTouchingPlatform(goldenBallX, goldenBallY, platformX, platformY)) {
            score += GOLDEN_BALL_SCORE;
            goldenBallSound.play();
            incrementGold();
            currentScoreDiv.innerText = `Score: ${score}`;
            goldenBallActive = false;
            setTimeout(resetGoldenBall, 5000);
        } else if (goldenBallY > canvas.height) {
            setTimeout(resetGoldenBall, 5000);
        }
    }

    if (!playerControlled) {
        imgX += imgSpeed;
        if (imgX <= 0 || imgX >= canvas.width - BALL_SIZE * 2) {
            imgSpeed = -imgSpeed;
        }
    }

    if (goldenBallX <= 0 || goldenBallX >= canvas.width - BALL_SIZE) {
        goldenBallSpeedX = -goldenBallSpeedX;
    }
    if (ballX <= 0 || ballX >= canvas.width - BALL_SIZE) {
        ballSpeedX = -ballSpeedX;
    }

    // Collision detection with platform
    if (ballY + BALL_SIZE >= platformY && ballX >= platformX && ballX <= platformX + PLATFORM_WIDTH) {
        score++;
        whiteBallSound.play();
        incrementWhite();
        ballSpeed = Math.min(maxBallSpeed, ballSpeed + 1);
        resetBall();
        currentScoreDiv.innerText = `Score: ${score}`;
        secondBallCounter++;
        if (secondBallCounter % 3 === 0) {
            resetSecondBalls();
        }

        if (score % 20 === 0 && score > 0) {
            moreSecondBalls();
        }

        if (score % 5 === 0 && score > 0) {
            increaseShipSpeed();
        }

        if (score >= WINNING_SCORE) {
            endGame(true);
            return;
        }
    } else if (ballY > canvas.height) {
        endGame();
        return;
    }
}

function endGame(win = false) {
    isGameOver = true;
    if (win) {
        drawWinScreen();
    } else {
        drawGameOver();
    }
    //scoreboard.push({ name: playerName, score });
    scoreboard.sort((a, b) => b.score - a.score);
    if (scoreboard.length > 20) {
        scoreboard.pop();
    }
    console.log(playerName);
    ws.send(JSON.stringify({
        type: 'score',
        name: playerName,
        playerScore: score
    }));
    wsForIncrement.send(JSON.stringify({
        type: 'action',
        content: 'end'
    }));
    setTimeout(restartGame, 4000);
}

function increaseShipSpeed() {
    imgSpeed = Math.min(MAX_SHIP_SPEED, imgSpeed + 0.5);
}
function calculateBackgroundColor(score) {
    const colors = [
        { r: 173, g: 216, b: 230 }, // Light blue
        { r: 160, g: 200, b: 220 },
        { r: 150, g: 180, b: 210 },
        { r: 140, g: 160, b: 200 },
        { r: 130, g: 140, b: 190 },
        { r: 120, g: 120, b: 180 },
        { r: 110, g: 100, b: 170 },
        { r: 100, g: 80, b: 160 }, // Purple
    ];
    const index = Math.min(Math.floor(score / 20), colors.length - 1);
    const color = colors[index];
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgColor = calculateBackgroundColor(score);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentBgImg) {
        ctx.drawImage(currentBgImg, 0, 0, canvas.width, canvas.height);
    }

    drawBall(ballX, ballY, ballColor);
    secondBalls.forEach(ball => drawBall(ball.x, ball.y, secondBallColor));
    if (goldenBallActive) {
        drawBall(goldenBallX, goldenBallY, goldenBallColor);
    }
    drawPlatform();
    ctx.drawImage(img, imgX, 0, BALL_SIZE * 5, BALL_SIZE * 5);
    if (isGameOver) {
        if (score >= WINNING_SCORE) {
            drawWinScreen();
        } else {
            drawGameOver();
        }
    }
}

function gameLoop() {
    update();
    draw();
    moves();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    qrCodePage1.style.display = 'none';
    qrCodePage2.style.display = 'none';
    resetGame();
    gameLoop();
}

function playMusic() {
    if (!musicStarted) {
        music1.play();
        musicStarted = true;
    }
}

function playMusic2() {
    if (!musicStarted) {
        titleMusic.play();
        musicStarted = true;
    }
}

function isBallTouchingPlatform(ballX, ballY, platformX, platformY) {
    const ballBottom = ballY + BALL_SIZE;
    const platformBottom = platformY + PLATFORM_HEIGHT;

    return (ballBottom >= platformY && ballY <= platformBottom &&
        ballX >= platformX && ballX <= platformX + PLATFORM_WIDTH);
}

let moveLeft = false;
let moveRight = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        moveLeft = true;
    } else if (e.key === 'd' || e.key === 'D') {
        moveRight = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        moveLeft = false;
    } else if (e.key === 'd' || e.key === 'D') {
        moveRight = false;
    }
});

function moves() {
    if (moveLeft) {
        platformX = Math.max(0, platformX - 5);
    }
    if (moveRight) {
        platformX = Math.min(canvas.width - PLATFORM_WIDTH, platformX + 5);
    }
}

updateScoreboard();

function initializeWebSocket() {

    ws.onopen = function () {
        console.log('WebSocket connection established');
    };

    wsForIncrement.onopen = function () {
        console.log('WebSocket for Increment connection established');
    };

    wsForIncrement.onmessage = function (event) {
        console.log('Message from server increment:', event.data);
    };

    ws.onmessage = function (event) {
        console.log('Message from server:', event.data);
    };

    wsForIncrement.onclose = function () {
        console.log('WebSocket for Increment connection closed');
    };

    ws.onclose = function () {
        console.log('WebSocket connection closed');
    };

    wsForIncrement.onerror = function (error) {
        console.error('WebSocket for Increment error:', error);
    };

    ws.onerror = function (error) {
        console.error('WebSocket error:', error);
    };

    function decodeBuffer(data) {
        return String.fromCharCode.apply(null, new Uint8Array(data));
    }

    ws.onmessage = function (event) {
        if (event.data instanceof Blob) {
            event.data.arrayBuffer().then(buffer => {
                const message = decodeBuffer(buffer);
                processWebSocketMessage(message);
            });
        } else if (event.data instanceof ArrayBuffer) {
            const message = decodeBuffer(event.data);
            processWebSocketMessage(message);
        } else if (typeof event.data === 'string') {
            let message = event.data;

            try {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === 'Buffer' && Array.isArray(parsedData.data)) {
                    message = decodeBuffer(parsedData.data);
                } else {
                    message = parsedData;
                }
            } catch (error) {
                console.warn('Error parsing message as JSON. Using original string.');
            }

            processWebSocketMessage(message);
        }
    };

    function processWebSocketMessage(message) {
        console.log('Message from server:', message);

        let data;
        try {
            if (typeof message === 'object') {
                data = message;
            } else {
                data = JSON.parse(message);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
            return;
        }

        if (data.type === 'scoreboard') {
            scoreboard.length = 0;
            data.scores.forEach(entry => {
                scoreboard.push({ name: entry.name, score: entry.score });
            });
            scoreboard.sort((a, b) => b.score - a.score);

            updateScoreboard();
        } else if (data.type === 'word') {
            if (typeof message === 'object' && message.type === 'word' && message.content.startsWith('name:')) {
                playerName = message.content.substring(5).trim();
                console.log('Player Name:', playerName);
            } else {
                switch (data.content) {
                    case 'right':
                        platformX = Math.min(canvas.width - PLATFORM_WIDTH, platformX + 50);
                        break;
                    case 'left':
                        platformX = Math.max(0, platformX - 50);
                        break;
                    case 'P2right':
                        if (playerControlled) {
                            imgX = Math.min(canvas.width - BALL_SIZE * 5, imgX + 50);
                        }
                        break;
                    case 'P2left':
                        if (playerControlled) {
                            imgX = Math.max(0, imgX - 50);
                        }
                        break;
                    case 'P2S':
                        drawBall(ballX, ballY, ballColor);
                        secondBalls.forEach(ball => drawBall(ball.x, ball.y, secondBallColor));
                        break;
                    case 'Option1':
                        startGame();
                        titleMusic.pause();
                        music1.play();
                        startScreen.style.display = 'none';
                        currentImgSrc = 'assets/ship.png';
                        img.src = currentImgSrc;
                        currentBgImg = bgImg1;
                        bgColor = '#ADD8E6';
                        teleport = false;
                        playerControlled = false;
                        break;
                    case 'Option2':
                        startGame();
                        titleMusic.pause();
                        music1.play();
                        startScreen.style.display = 'none';
                        currentImgSrc = 'assets/wizzard.png';
                        img.src = currentImgSrc;
                        currentBgImg = bgImg2;
                        bgColor = '#000000';
                        teleport = true;
                        playerControlled = false;
                        clearInterval(teleportInterval);
                        teleportInterval = setInterval(() => {
                            imgX = Math.random() * (canvas.width - BALL_SIZE * 2);
                        }, 2000);
                        break;
                    case 'Option3':
                        startScreen.style.display = 'none';
                        waitingScreen.style.display = 'none';
                        qrCodePage2.style.display = 'flex';
                        option3 = true;
                        break;
                    case '2Player':
                        if (!option3) return; // Check if option3 is true so that the game doesnt render before the QR code is scanned
                        startScreen.style.display = 'none';
                        qrCodePage1.style.display = 'none';
                        qrCodePage2.style.display = 'none';
                        waitingScreen.style.display = 'flex';
                        break;
                    case 'controlleropen':
                        if (ready) {
                            ws.send(JSON.stringify({
                                type: 'word',
                                content: 'gameState:started'
                            }));
                        }
                        break;
                    case 'controllerReady':
                        ready = false;
                        break;
                    case 'Bereit':
                        ready1 = true;
                        break;
                    case 'Bereit2':
                        ready2 = true;
                        break;
                    default:
                        console.log('Unknown command in word type:', data.content);
                }
                if (ready1 && ready2) {
                    titleMusic.pause();
                    waitingScreen.style.display = 'none';
                    currentImgSrc = 'assets/ship.png';
                    img.src = currentImgSrc;
                    currentBgImg = bgImg1;
                    bgColor = '#ADD8E6';
                    teleport = false;
                    playerControlled = true;
                    startGame();
                    music1.play();
                    ready1 = false;
                    ready2 = false;
                }
            }
        } else {
            console.log('Unknown message type:', data.type);
        }
    }
}

// Initialize WebSocket connection when the script loads
initializeWebSocket();
