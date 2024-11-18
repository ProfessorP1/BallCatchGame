let musicStarted = false;
let gameStarted = false;
const Music = document.getElementById('musik1');

// Function to play background music
function playMusic() {
    if (!musicStarted) {
        Music.play();
        musicStarted = true;
    }
}

// Initialize WebSocket connection
const ws = new WebSocket('wss://fanzy.club:8080');
ws.onopen = () => {
    console.log('WebSocket connection established');
    ws.send(JSON.stringify({ type: 'word', content: `controlleropen` })); //controlleropen
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'word' && data.content === 'gameState:started') {
        gameStarted = true;
        console.log("GameBereiterhalten");
        
    }

}

// DOM elements
const nameInputSection = document.getElementById('nameInputSection');
const menuScreen = document.getElementById('menuScreen');
const controlSection = document.getElementById('controlSection');
const bereitKnopf = document.getElementById('bereitKnopf');

let playerName = '';
let gameModeSelected = false;

// Handle name submission
document.getElementById('sendNameButton').addEventListener('click', () => {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
    if (gameStarted === true) {
        playerName = name;
        ws.send(JSON.stringify({ type: 'word', content: `name: ${playerName}` }));
        ws.send(JSON.stringify({ type: 'word', content: `controllerReady` }));
        console.log(`Name registered: ${playerName}`);
        nameInputSection.style.display = 'none';
        menuScreen.style.display = 'flex';
    } else {
        alert('The Game has not started yet');
    }} else {
        alert('Please enter a name'); 
    }
});

// Function to handle game mode selection
function selectGameMode(mode) {
    if (playerName) {
        ws.send(JSON.stringify({ type: 'word', content: mode }));
        console.log(`Game mode selected: ${mode}`);
        gameModeSelected = true;
        menuScreen.style.display = 'none';
        controlSection.style.display = 'flex';
        startGame();
    } else {
        alert('Please register your name first');
    }
}

// Handle game mode selection
document.getElementById('option1').addEventListener('click', () => selectGameMode('Option1'));
document.getElementById('option2').addEventListener('click', () => selectGameMode('Option2'));
document.getElementById('option3').addEventListener('click', () => {
    selectGameMode('Option3');
    bereitKnopf.style.display = 'flex';
    controlSection.style.display = 'none';

});
document.getElementById('bereitKnopf').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'word', content: 'Bereit' }));;
    bereitKnopf.style.display = 'none';
    controlSection.style.display = 'flex';
});
// Start the game
function startGame() {
    if (playerName && gameModeSelected) {
        console.log('Starting game...');
        ws.send(JSON.stringify({ type: 'word', content: 'startGame' }));
        playMusic();
    }
}

// Function to handle button press events
function handleButtonPress(buttonId, message) {
    let intervalId;
    const button = document.getElementById(buttonId);

    button.addEventListener('mousedown', () => {
        console.log(`Sending ${message} command`);
        ws.send(JSON.stringify({ type: 'word', content: message }));
        intervalId = setInterval(() => {
            ws.send(JSON.stringify({ type: 'word', content: message }));
        }, 100);
    });

    button.addEventListener('mouseup', () => clearInterval(intervalId));
    button.addEventListener('mouseleave', () => clearInterval(intervalId));
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log(`Sending ${message} command`);
        ws.send(JSON.stringify({ type: 'word', content: message }));
        intervalId = setInterval(() => {
            ws.send(JSON.stringify({ type: 'word', content: message }));
        }, 100);
    });
    button.addEventListener('touchend', () => clearInterval(intervalId));
    button.addEventListener('touchcancel', () => clearInterval(intervalId));
}

// Set up button press handlers
handleButtonPress('leftButton', 'left');
handleButtonPress('rightButton', 'right');
