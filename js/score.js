const ws = new WebSocket('wss://ballcatch.glitch.me');

ws.onmessage = function(event) {
    const scores = JSON.parse(event.data);
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = ''; // clear list before adding new scores
    scores.forEach((score) => {
        const li = document.createElement('li');
        // Füge die Rangnummer vor dem Namen hinzu
        li.textContent = `#${score.rank} ${score.name}: ${score.score}`;
        scoreList.appendChild(li);
    });
};

// Sending Score to server
function sendScore(name, score) {
    const scoreData = JSON.stringify({ type: 'score', name: name, playerScore: score });
    ws.send(scoreData);
}

// Test: Sende einen Score nach 5 Sekunden
// setTimeout(() => {
//     sendScore('TestPlayer', 100);
// }, 5000);
