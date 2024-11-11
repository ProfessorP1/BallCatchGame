const scoreboardDiv = document.getElementById('scoreboard');
const scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];

let score = 0;
let playerName = '';

function updateScoreboard() {
    scoreboardDiv.innerHTML = '<h2>Scoreboard</h2><ol>' + scoreboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('') + '</ol>';
}

function clearScoreboard() {
    localStorage.removeItem('scoreboard');
    scoreboard.length = 0;
    updateScoreboard();
}

updateScoreboard();
initializeWebSocket();

function initializeWebSocket() {
    const ws = new WebSocket('wss://ballcatch.glitch.me');

    ws.onopen = function() {
        console.log('WebSocket connection established');
    };

    ws.onmessage = function(event) {
        console.log('Message from server:', event.data);
        processWebSocketMessage(event.data);
    };

    ws.onclose = function() {
        console.log('WebSocket connection closed');
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    function decodeBuffer(data) {
        return String.fromCharCode.apply(null, new Uint8Array(data));
    }

    function processWebSocketMessage(message) {
        if (message.startsWith('Score:')) {
            score = message.substring(6).trim();
            scoreboard.push({ name: playerName, score });
            scoreboard.sort((a, b) => b.score - a.score);
            if (scoreboard.length > 20) {
                scoreboard.pop();
            }
            updateScoreboard();
        }
        if (message.startsWith('Playername:')) {
            playerName = message.substring(11).trim();
            scoreboard.push({ name: playerName, score });
            scoreboard.sort((a, b) => b.score - a.score);
            if (scoreboard.length > 20) {
                scoreboard.pop();
            }
            updateScoreboard();
        }
    }
}
