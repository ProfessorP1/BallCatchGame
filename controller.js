const socket = new WebSocket('wss://your-project-name.glitch.me');

document.getElementById('left').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'command', direction: 'left' }));
});

document.getElementById('right').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'command', direction: 'right' }));
});

document.getElementById('up').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'command', direction: 'up' }));
});

document.getElementById('down').addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'command', direction: 'down' }));
});
