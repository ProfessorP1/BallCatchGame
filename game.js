const socket = new WebSocket('wss://scoreboard4.glitch.me'); // Ersetze dies durch die URL deines WebSocket-Servers

let canvas, context;
let ball = { x: 400, y: 300, radius: 15, color: 'black' };
let score = 0;

window.onload = () => {
  canvas = document.getElementById('gameCanvas');
  context = canvas.getContext('2d');
  drawBall();

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'command') {
      handleCommand(data.command);
    }
  };
};

function drawBall() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = ball.color;
  context.fill();
  context.closePath();
}

function handleCommand(command) {
  switch (command) {
    case 'left':
      ball.x -= 10;
      break;
    case 'right':
      ball.x += 10;
      break;
    case 'up':
      ball.y -= 10;
      break;
    case 'down':
      ball.y += 10;
      break;
  }
  drawBall();
  updateScore();
}

function updateScore() {
  score++;
  document.getElementById('score').innerText = `Score: ${score}`;
}

