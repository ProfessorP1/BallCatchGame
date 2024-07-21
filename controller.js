const socket = new WebSocket('wss://your-glitch-project-name.glitch.me');

document.getElementById('left').addEventListener('click', () => {
  sendCommand('left');
});

document.getElementById('right').addEventListener('click', () => {
  sendCommand('right');
});

document.getElementById('up').addEventListener('click', () => {
  sendCommand('up');
});

document.getElementById('down').addEventListener('click', () => {
  sendCommand('down');
});

function sendCommand(command) {
  const message = JSON.stringify({ type: 'command', command });
  socket.send(message);
}
