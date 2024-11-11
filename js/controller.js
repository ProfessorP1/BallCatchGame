let musicStarted = false;
const Music = document.getElementById('musik1');

function playMusic() {
    if (!musicStarted) {
        Music.play();
        musicStarted = true;
    }
}

function Haptic() {
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

const ws = new WebSocket('wss://ballcatch.glitch.me');
ws.onopen = () => {
    console.log('WebSocket connection established');
    ws.send(JSON.stringify({
        type: 'word',
        content: 'controller'
    }));
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

const bereit = document.getElementById('bereit');
const nameInputSection = document.getElementById('nameInputSection');
const controlSection = document.getElementById('controlSection');

bereit.addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'Bereit'
    }));
    bereitKnopf.style.display = 'none';
    controlSection.style.display = 'flex';
});

document.getElementById('sendNameButton').addEventListener('click', () => {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
        ws.send(JSON.stringify({
            type: 'word',
            content: 'Test'
        }));
        ws.send(JSON.stringify({
            type: 'word',
            content: `name: ${name}`
        }));
        console.log(`Sending name: ${name}`);
        nameInputSection.style.display = 'none';
        controlSection.style.display = 'flex';
    } else {
        alert('Please enter a name');
    }
});

function handleButtonPress(buttonId, message) {
    let intervalId;
    const button = document.getElementById(buttonId);

    const sendMessage = () => {
        console.log(`Sending ${message} command`);
        ws.send(JSON.stringify({
            type: 'word',
            content: message
        }));
    };

    button.addEventListener('mousedown', () => {
        sendMessage();
        intervalId = setInterval(sendMessage, 100);
    });

    button.addEventListener('mouseup', () => {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', () => {
        clearInterval(intervalId);
    });

    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sendMessage();
        intervalId = setInterval(sendMessage, 100);
    });

    button.addEventListener('touchend', () => {
        clearInterval(intervalId);
    });

    button.addEventListener('touchcancel', () => {
        clearInterval(intervalId);
    });
}

handleButtonPress('leftButton', 'left');
handleButtonPress('rightButton', 'right');

const option1Button = document.getElementById('option1');
const option2Button = document.getElementById('option2');
const option3Button = document.getElementById('option3');

option1Button.addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'Option1'
    }));
    menuScreen.style.display = 'none';
    Haptic();
});

option2Button.addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'Option2'
    }));
    menuScreen.style.display = 'none';
});

option3Button.addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'Option3'
    }));
    menuScreen.style.display = 'none';
    nameInputSection.style.display = 'none';
    controlSection.style.display = 'none';
    bereitKnopf.style.display = 'flex';
});
