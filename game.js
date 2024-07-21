let canvas, context;
let ball = { x: 400, y: 300, radius: 15, color: 'black' };
let score = 0;

window.onload = () => {
  canvas = document.getElementById('gameCanvas');
  context = canvas.getContext('2d');
  drawBall();

  document.addEventListener('keydown', handleKeyPress);
};

function drawBall() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = ball.color;
  context.fill();
  context.closePath();
}

function handleKeyPress(event) {
  switch (event.key) {
    case 'ArrowLeft':
      ball.x -= 10;
      break;
    case 'ArrowRight':
      ball.x += 10;
      break;
    case 'ArrowUp':
      ball.y -= 10;
      break;
    case 'ArrowDown':
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
