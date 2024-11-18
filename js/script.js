const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const scoreboardDiv = document.getElementById('scoreboard');
const currentScoreDiv = document.getElementById('currentScore');
const startScreen = document.getElementById('startScreen');
const Nameeingabe = document.getElementById('starScreen');
const warteScreen = document.getElementById('warteScreen');

const BALL_SIZE = 20;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 10;
const GOLDEN_BALL_INTERVAL = 5000;
const GOLDEN_BALL_SCORE = 5;
const WINNING_SCORE = 300;
const MAX_SHIP_SPEED = 10;
const Music = document.getElementById('musik1');
const RBS = document.getElementById('RB');
const GBS = document.getElementById('GB');
const WBS = document.getElementById('WB');
const Music2 = document.getElementById('TM');
let ballSpeed = 5;
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
let maxBallSpeed = 20;
let maxImgSpeed = 8;
let teleport = false;
let teleportInterval;
let playerControlled = false;
let S2 = 1;
let Wert = 0;
let musicStarted = false;
let B = 0;
let I = 0;
let Backup = false;
let Ready = false;

const scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];

// Load images
const img = new Image();
const platformImg = new Image();
const gameOverImg = new Image();
const bgImg1 = new Image();
const bgImg2 = new Image();
let currentImgSrc = 'assets/B1.png';
let currentBgImg = null;

img.src = currentImgSrc;
platformImg.src = 'assets/B2.png';
gameOverImg.src = 'assets/B3.png';
bgImg1.src = 'assets/B5.png';
bgImg2.src = 'assets/B8.png';

function resetBall() {
    ballX = imgX;
    ballY = 0;
    ballSpeedY = ballSpeed * 0.3;
    ballSpeedX = (Math.random() + 1.2) * 2;
}

function resetSecondBalls() {
    for (let i = 0; i < 2; i++) {
        secondBalls.push({
            x: imgX,
            y: 0,
            speedY: ballSpeed * 0.2,
            speedX: (Math.random() - 0.5) * 1
        });
    }
}

function resetGoldenBall() {
    goldenBallX = imgX;
    goldenBallY = -30;
    goldenBallSpeedY = ballSpeed * 0.3;
    goldenBallSpeedX = Math.max((Math.random() + 1.0) * 2, 1.5);
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
    secondBalls = [];
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
    ctx.fillStyle = '#ffffff';
    ctx.font = '75px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 200, canvas.height / 2);
}

function drawWinScreen() {
    ctx.drawImage(gameOverImg, canvas.width / 2 - gameOverImg.width / 2, canvas.height / 2 - gameOverImg.height / 2);
}

function updateScoreboard() {
    scoreboardDiv.innerHTML = '<h2>Scoreboard</h2><ol>' + scoreboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('') + '</ol>';
}

function clearScoreboard() {
    localStorage.removeItem('scoreboard');
    scoreboard.length = 0;
    updateScoreboard();
}

function neustart() {
    Ende();
    location.reload();
}

function decrement() {
    ws.send(JSON.stringify({
        type: 'action',
        content: 'decrement'
    }));
}

function incrementWhite() {
    ws.send(JSON.stringify({
        type: 'action',
        content: 'incrementWhite'
    }))
}

function incrementGold() {
    ws.send(JSON.stringify({
        type: 'action',
        content: 'incrementGold'
    }))
}

start.addEventListener('click', () => {
    Music.pause();
    Music2.play();
    Ready = true;
    StartButton.style.display = 'none';
    QRCodeSeite1.style.display = 'flex';
    startScreen.style.display = 'none';
})

function update() {
    if (isGameOver)
        return;

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
            RBS.play();
            decrement();
            currentScoreDiv.innerText = `Score: ${score}`;
            secondBalls.splice(index, 1);

            if (score < 0) {
                isGameOver = true;
                drawGameOver();
                scoreboard.push({ name: playerName, score });
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
                setTimeout(neustart, 3000);
                localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
                updateScoreboard();
                return;
            }
        } else if (ball.y > canvas.height) {
            secondBalls.splice(index, 1);
        }
    });

    if (goldenBallActive) {
        if (isBallTouchingPlatform(goldenBallX, goldenBallY, platformX, platformY)) {
            score += GOLDEN_BALL_SCORE;
            GBS.play();
            incrementGold();
            currentScoreDiv.innerText = `Score: ${score}`;
            goldenBallActive = false;
            setTimeout(resetGoldenBall, 5000);
        } else if (goldenBallY > canvas.height) {
            setTimeout(resetGoldenBall, 5000);
        }
    }

    // Move ship
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

    // Collision
    if (ballY + BALL_SIZE >= platformY && ballX >= platformX && ballX <= platformX + PLATFORM_WIDTH) {
        score++;
        WBS.play();
        incrementWhite();
        ballSpeed = Math.min(maxBallSpeed, ballSpeed + 1);
        resetBall();
        currentScoreDiv.innerText = `Score: ${score}`;
        secondBallCounter++;
        if (secondBallCounter % 3 === 0) {
            resetSecondBalls();
        }

        if (score % 5 === 0 && score > 0) {
            increaseShipSpeed();
        }

        if (score === 25 || score === 50 || score === 100) {
            ballSpeed = Math.min(maxBallSpeed, ballSpeed * 1.5);
            if (!teleport) {
                imgSpeed = Math.min(maxImgSpeed, imgSpeed * 1.5);
            } else {
                clearInterval(teleportInterval);
                let newInterval = 4000 / (Math.pow(1.5, Math.floor(score / 25)));
                teleportInterval = setInterval(() => {
                    imgX = Math.random() * (canvas.width - BALL_SIZE * 2);
                }, newInterval);
            }
        }

        if (score >= WINNING_SCORE) {
            isGameOver = true;
            drawWinScreen();
            ws.send("clear");
            scoreboard.push({ name: playerName, score });
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
            localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
            updateScoreboard();
            setTimeout(neustart, 3000);
            return;
        }
    } else if (ballY > canvas.height) {
        console.log("Ball fell out of bounds");
        isGameOver = true;
        drawGameOver();
        scoreboard.push({ name: playerName, score });
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
        localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
        updateScoreboard();
        setTimeout(neustart, 3000);
        return;
    }
}

function increaseShipSpeed() {
    imgSpeed = Math.min(MAX_SHIP_SPEED, imgSpeed + 0.5);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentBgImg) {
        ctx.drawImage(currentBgImg, 0, 0, canvas.width, canvas.height);
    } else if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    Moves();
    requestAnimationFrame(gameLoop);
}

const images = ['assets/B10.png', 'assets/B11.png', 'assets/B12.png'];
images.forEach((src, index) => {
    const img = new Image();
    img.src = src;
});

function startGame() {
    QRCodeSeite1.style.display = 'none';
    QRCodeSeite2.style.display = 'none';
    resetGame();
    gameLoop();
}

function playMusic() {
    if (!musicStarted) {
        Music.play();
        musicStarted = true;
    }
}

function playMusic2() {
    if (!musicStarted) {
        Music2.play();
        musicStarted = true;
    }
}

function isBallTouchingPlatform(ballX, ballY, platformX, platformY) {
    const ballBottom = ballY + BALL_SIZE;
    const platformBottom = platformY + PLATFORM_HEIGHT;

    return (ballBottom >= platformY && ballY <= platformBottom &&
        ballX >= platformX && ballX <= platformX + PLATFORM_WIDTH);
}

function Ende() {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'end'
    }));
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

function Moves() {
    if (moveLeft) {
        platformX = Math.max(0, platformX - 5);
    }
    if (moveRight) {
        platformX = Math.min(canvas.width - PLATFORM_WIDTH, platformX + 5);
    }
}

updateScoreboard();

let S1 = 1;
let ws;

function initializeWebSocket() {
    ws = new WebSocket('wss://ballcatch.glitch.me');

    ws.onopen = function () {
        console.log('WebSocket connection established');
    };

    ws.onmessage = function (event) {
        console.log('Message from server:', event.data);
    };

    ws.onclose = function () {
        console.log('WebSocket connection closed');
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
                console.warn('Fehler beim Parsen der Nachricht als JSON. Verwende den ursprünglichen String.');
            }

            processWebSocketMessage(message);
        }
    };

    function processWebSocketMessage(message) {
        console.log('Nachricht vom Server:', message);

        let data;
        try {
            if (typeof message === 'object') {
                data = message;
            } else {
                data = JSON.parse(message);
            }
        } catch (error) {
            console.error('Fehler beim Parsen der Nachricht:', error);
            return;
        }

        if (data.type === 'word') {
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
                        B = 1;
                        break;
                    case 'Option1':
                        startGame();
                        Music2.pause();
                        Music.play();
                        startScreen.style.display = 'none';
                        currentImgSrc = 'assets/B1.png';
                        img.src = currentImgSrc;
                        currentBgImg = bgImg1;
                        bgColor = '#ADD8E6';
                        teleport = false;
                        playerControlled = false;
                        break;
                    case 'Option2':
                        startGame();
                        Music2.pause();
                        Music.play();
                        startScreen.style.display = 'none';
                        currentImgSrc = 'assets/B4.png';
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
                        warteScreen.style.display = 'none';
                        QRCodeSeite2.style.display = 'flex';
                        break;
                    case '2Player':
                        warteScreen.style.display = 'flex';
                        QRCodeSeite2.style.display = 'none';
                        break;
                    case 'clear':
                        clearScoreboard();
                        break;
                    case 'controlleropen':
                        if (Ready === true) {
                        ws.send(JSON.stringify({
                            type: 'word',
                            content: 'gameState:started'
                        }));
                        }
                        break;
                    case 'controllerReady':
                        Ready = false;
                        break;
                    case 'Bereit':
                        I++;
                        if (I === 2) {
                            warteScreen.style.display = 'none';
                            currentImgSrc = 'assets/B1.png';
                            img.src = currentImgSrc;
                            currentBgImg = bgImg1;
                            bgColor = '#ADD8E6';
                            teleport = false;
                            playerControlled = true;
                            startGame();
                            Music.play();
                        }
                        break;
                    case 'Backup':
                        Backup = true;
                    default:
                        console.log('Unbekannter Befehl im Worttyp:', data.content);
                }
            }
        } else {
            console.log('Unbekannter Nachrichtentyp:', data.type);
        }
    }
}
// Initialize WebSocket connection when the script loads
initializeWebSocket();
