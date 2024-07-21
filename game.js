const socket = new WebSocket('wss://your-project-name.glitch.me');

let score = 0;

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Command received:', data);
  if (data.type === 'scoreUpdate') {
    score = data.score;
    updateScoreDisplay();
  }
};

function updateScoreDisplay() {
  document.getElementById('score').innerText = `Score: ${score}`;
}

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
// Hier können Sie Ihr Spiel implementieren
