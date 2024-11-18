const scoreboardDiv = document.getElementById('scoreboard');
const scoreboard = [];
const ws = new WebSocket('wss://fanzy.club:8080');

let score = 0;
let playerName = '';

function updateScoreboard() {
    scoreboardDiv.innerHTML = '<h2>Scoreboard</h2><ol>' + scoreboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('') + '</ol>';
}

function clearScoreboard() {
    scoreboard.length = 0;
    updateScoreboard();
}

updateScoreboard();
initializeWebSocket();

function initializeWebSocket() {

    ws.onopen = function () {
        console.log('WebSocket connection established');
    };

    ws.onmessage = function (event) {
        console.log('Message from server:', event.data);
        processWebSocketMessage(event.data);
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

    function processWebSocketMessage(message) {
        try {
            const data = JSON.parse(message);

            if (data.type === 'scoreboard' && Array.isArray(data.scores)) {
                scoreboard.length = 0;

                data.scores.forEach(entry => {
                    scoreboard.push({ name: entry.name, score: entry.score });
                });

                scoreboard.sort((a, b) => b.score - a.score);

                updateScoreboard();
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    }
}
