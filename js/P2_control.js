const ws = new WebSocket('wss://ballcatch.glitch.me');
ws.onopen = () => {
    console.log('WebSocket connection established');
    ws.send(JSON.stringify({
        type: 'word',
        content: '2Player'
    }));
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

const bereit = document.getElementById('bereit');
const controlSection = document.getElementById('controlSection');

bereit.addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'Bereit'
    }));
    bereitKnopf.style.display = 'none';
    controlSection.style.display = 'flex';
});

function handleButtonPress(buttonId, message) {
    let intervalId;
    const button = document.getElementById(buttonId);

    button.addEventListener('mousedown', () => {
        console.log(`Sending ${message} command`);
        ws.send(JSON.stringify({
            type: 'word',
            content: message
        }));
        intervalId = setInterval(() => {
            ws.send(JSON.stringify({
                type: 'word',
                content: message
            }));
        }, 100);
    });

    button.addEventListener('mouseup', () => {
        clearInterval(intervalId);
    });

    button.addEventListener('mouseleave', () => {
        clearInterval(intervalId);
    });

    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log(`Sending ${message} command`);
        ws.send(JSON.stringify({
            type: 'word',
            content: message
        }));
        intervalId = setInterval(() => {
            ws.send(JSON.stringify({
                type: 'word',
                content: message
            }));
        }, 100);
    });

    button.addEventListener('touchend', () => {
        clearInterval(intervalId);
    });

    button.addEventListener('touchcancel', () => {
        clearInterval(intervalId);
    });
}

handleButtonPress('leftButton', 'P2left');
handleButtonPress('rightButton', 'P2right');
