const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

function broadcast(data, ws) {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on('connection', ws => {
    const clientID = uuidv4(); 
    clients.set(clientID, { ws, name: null });

    console.log(`New client connected: ${clientID}`);

    ws.send(JSON.stringify({
        type: 'session',
        sessionID: clientID
    }));

    ws.on('message', message => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'name': 
                clients.get(clientID).name = parsedMessage.name;
                console.log(`Client ${clientID} set name to ${parsedMessage.name}`);
                break;

            case 'message': 
                const clientName = clients.get(clientID).name || 'Anonymous';
                const dataToSend = JSON.stringify({
                    type: 'message',
                    name: clientName,
                    message: parsedMessage.message
                });
                broadcast(dataToSend, ws);
                break;

            default:
                console.log(`Unknown message type: ${parsedMessage.type}`);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${clientID}`);
        clients.delete(clientID);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
