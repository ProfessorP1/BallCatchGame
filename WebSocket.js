// Websocket on Server

const fs = require("fs");
const path = require("path");
const https = require("https");
const WebSocket = require("ws");

const port = 8080;

// Read certificates for HTTPS
const serverOptions = {
    cert: fs.readFileSync("/path/to/certificate.pem"),
    key: fs.readFileSync("/path/to/key.key")
};

const server = https.createServer(serverOptions);
const wss = new WebSocket.Server({ server });

let scores = [];
// Path to the scoreboard file
const scoreboardFilePath = path.join(__dirname, "scoreboard.json");

// loading scores from the file
function loadScores() {
    if (fs.existsSync(scoreboardFilePath)) {
        try {
            const data = fs.readFileSync(scoreboardFilePath, "utf-8");
            scores = JSON.parse(data) || [];
            console.log("Scores loaded:", scores);
        } catch (error) {
            console.error("Error parsing scoreboard.json:", error);
            scores = [];
        }
    } else {
        // Create the scoreboard file
        fs.writeFileSync(scoreboardFilePath, JSON.stringify(scores, null, 2), "utf-8");
        console.log("scoreboard.json created.");
    }
}

// save scores to the file
function saveScores() {
    fs.writeFile(scoreboardFilePath, JSON.stringify(scores, null, 2), (err) => {
        if (err) {
            console.error("Error saving scores:", err);
        } else {
            console.log("Scores saved to scoreboard.json");
        }
    });
}

// This function is used to send the scores to the clients
function getRankedScores(scores) {
    return {
        type: 'scoreboard',
        scores: scores
    };
}

// message all clients
function broadcastMessage(message) {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}
loadScores();

server.listen(port, () => {
    console.log(`HTTPS WebSocket server started on port ${port}`);
});

wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`New client connected: ${ip}`);

    // Send the initial scores to the client
    ws.send(JSON.stringify(getRankedScores(scores)));
    ws.on("message", (message) => {
        console.log(`Received from ${ip}: ${message}`);

        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'score':
                    // Add the new score to the list
                    scores.push({ name: data.name, score: data.playerScore });
                    // Sort the scores in descending order
                    scores.sort((a, b) => b.score - a.score);

                    // max 100 scores
                    if (scores.length > 100) {
                        scores.pop();
                    }

                    const rankedScores = getRankedScores(scores);

                    // Broadcast the updated scores to all clients
                    broadcastMessage(rankedScores);
                    // Save the scores to the file
                    saveScores();
                    break;

                case 'word':
                    broadcastMessage({
                        type: 'word',
                        content: data.content
                    });
                    break;
                /* not needed anymore because of 2 websocket servers
                case 'action':
                    broadcastMessage({
                        type: 'action',
                        content: data.content
                    });
                    break;*/
                default:
                    // Handle unknown message types
                    console.log(`Unknown message type from ${ip}:`, data.type);
                    break;
            }
        } catch (error) {
            console.error(`Error parsing message from ${ip}:`, error);
        }
    });
    ws.on("close", () => {
        console.log(`Client disconnected: ${ip}`);
    });
});