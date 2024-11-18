const ws = new WebSocket('wss://fanzy.club:8080');

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

const readyBtn = document.getElementById('readyBtn');
const controlSection = document.getElementById('controlSection');

document.getElementById('readyBtn').addEventListener('click', () => {
    ws.send(JSON.stringify({
        type: 'word',
        content: 'Bereit2'
    }));
    readySection.style.display = 'none';
    controlSection.style.display = 'flex';
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

    button.addEventListener('mouseup', () => clearInterval(intervalId));
    button.addEventListener('mouseleave', () => clearInterval(intervalId));


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

    button.addEventListener('touchend', () => clearInterval(intervalId));
    button.addEventListener('touchcancel', () => clearInterval(intervalId));
}

handleButtonPress('leftBtn', 'P2left');
handleButtonPress('rightBtn', 'P2right');