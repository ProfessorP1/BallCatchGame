let musicStarted = false;
const Music = document.getElementById('musik1');

// Function to play background music
function playMusic() {
    if (!musicStarted) {
        Music.play();
        musicStarted = true;
    }
}
const ws = new WebSocket('wss://ballcatch.glitch.me');

nameInputSection.style.display = 'flex';

ws.onopen = () => {
    console.log('WebSocket connection established');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

document.addEventListener('DOMContentLoaded', () => {
    const nameInputSection = document.getElementById('nameInputSection');
    const menuScreen = document.getElementById('menuScreen');
    const bereitKnopf = document.getElementById('bereitKnopf');
    const bereitButton = document.getElementById('bereit');
    const controlSection = document.getElementById('controlSection');
    const sendNameButton = document.getElementById('sendNameButton');
    let playerName = '';
    let gameStarted = false;

    console.log('Game started status:', gameStarted);

    // Handle name submission
    sendNameButton.addEventListener('click', () => {
        let controllerInterval;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'word') {
                if (data.content === 'gameState:started') {
                    controllerInterval = setInterval(() => {
                        ws.send(JSON.stringify({
                            type: 'word',
                            content: 'controller:started'
                        }));
                    }, 3000);
                    gameStarted = true;
                    console.log('Received gameState:started; Send controller:started until end');
                }
                if (data.content === 'gameState:stopped') {
                    ws.send(JSON.stringify({
                        type: 'word',
                        content: 'controller:stopped'
                    }));
                    clearInterval(controllerInterval);
                    gameStarted = false;
                    console.log('Received gameState:stopped; Send controller:stopped');
                }
            }
        };
        if (!gameStarted) {
            alert('The game has not started yet. Please wait.');
            return;
        }
        const name = document.getElementById('nameInput').value.trim();
        if (name) {
            playerName = name;
            nameInputSection.style.display = 'none';
            menuScreen.style.display = 'flex';
            ws.send(JSON.stringify({ type: 'word', content: `name:${playerName}` })); // Send player name
        } else {
            alert('Please enter a name');
        }
    });

    // Function to handle game mode selection
    function selectGameMode(mode) {
        if (playerName) {
            menuScreen.style.display = 'none';
            if (mode === 'Option3') {
                bereitKnopf.style.display = 'flex';
                menuScreen.style.display = 'none';
                nameInputSection.style.display = 'none';
                controlSection.style.display = 'none';
                ws.send(JSON.stringify({ type: 'word', content: 'Option3' })); // Send message for Option 3
            } else {
                controlSection.style.display = 'flex';
                ws.send(JSON.stringify({ type: 'word', content: mode })); // Send message for other options
            }
        } else {
            alert('Please register your name first.');
        }
    }

    // Function to handle Bereit button click
    function onBereitClicked() {
        ws.send(JSON.stringify({
            type: 'word',
            content: 'Bereit'
        }));
        bereitKnopf.style.display = 'none';
        controlSection.style.display = 'flex';
    }

    // Add event listeners for game mode selection
    document.getElementById('option1').addEventListener('click', () => selectGameMode('Option1'));
    document.getElementById('option2').addEventListener('click', () => selectGameMode('Option2'));
    document.getElementById('option3').addEventListener('click', () => selectGameMode('Option3'));

    // Add event listener to readybtn
    bereitButton.addEventListener('click', onBereitClicked);

    if (gameStarted) {
        ws.send(JSON.stringify({
            type: 'word',
            content: 'gameState:stopped'
        }));
    }
});


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