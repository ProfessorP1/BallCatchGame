const socket = new WebSocket('wss://scoreboard4.glitch.me'); // Ersetze dies durch die URL deines WebSocket-Servers

window.onload = () => {
  socket.onopen = () => {
    console.log('WebSocket-Verbindung geöffnet');
  };

  socket.onclose = () => {
    console.log('WebSocket-Verbindung geschlossen');
  };

  socket.onerror = (error) => {
    console.error('WebSocket-Fehler:', error);
  };
};

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
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.error('WebSocket ist nicht geöffnet.');
  }
}
