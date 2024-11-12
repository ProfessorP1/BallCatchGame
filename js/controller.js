let musicStarted = false;
const Music = document.getElementById('musik1');

// Function to play background music
function playMusic() {
    if (!musicStarted) {
        Music.play();
        musicStarted = true;
    }
}

// Function to trigger haptic feedback
function Haptic() {
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

// Initialize WebSocket connection
const ws = new WebSocket('wss://ballcatch.glitch.me');
ws.onopen = () => {
    console.log('WebSocket connection established');
    // Do not send any start command here
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

// DOM elements
const nameInputSection = document.getElementById('nameInputSection');
const menuScreen = document.getElementById('menuScreen');
const controlSection = document.getElementById('controlSection');
const bereitKnopf = document.getElementById('bereitKnopf');

// Handle name submission
document.getElementById('sendNameButton').addEventListener('click', () => {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
        ws.send(JSON.stringify({ type: 'word', content: `name: ${name}` }));
        console.log(`Sending name: ${name}`);
        nameInputSection.style.display = 'none';
        menuScreen.style.display = 'flex';
    } else {
        alert('Please enter a name');
    }
});

// Function to handle button press events
function handleButtonPress(buttonId, message) {
    let intervalId;
    const button = document.getElementById(buttonId);

    button.addEventListener('mousedown', () => {
        console.log(`Sending ${message} command`);
        if (message === 'left' || message === 'right') {
            Haptic();
        }
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

// Handle game mode selection
document.getElementById('option1').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'word', content: 'Option1' }));
    menuScreen.style.display = 'none';
    controlSection.style.display = 'flex';
    Haptic();
    // Start the game logic here
    ws.send(JSON.stringify({ type: 'word', content: 'startGame' }));
});

document.getElementById('option2').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'word', content: 'Option2' }));
    menuScreen.style.display = 'none';
    controlSection.style.display = 'flex';
    // Start the game logic here
    ws.send(JSON.stringify({ type: 'word', content: 'startGame' }));
});

document.getElementById('option3').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'word', content: 'Option3' }));
    menuScreen.style.display = 'none';
    controlSection.style.display = 'flex';
    bereitKnopf.style.display = 'flex';
    // Start the game logic here
    ws.send(JSON.stringify({ type: 'word', content: 'startGame' }));
});