const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:5000');

let sessionID = null;

ws.on('open', () => {
    console.log('Connected to WebSocket server');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Enter your name: ", (name) => {
        ws.send(JSON.stringify({ type: 'name', name }));

        rl.on('line', (message) => {
            ws.send(JSON.stringify({
                type: 'message',
                message
            }));
        });
    });
});

ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
        case 'session':
            sessionID = parsedMessage.sessionID;
            console.log(`Your session ID: ${sessionID}`);
            break;

        case 'message':
            console.log(`${parsedMessage.name}: ${parsedMessage.message}`);
            break;

        default:
            console.log('Unknown message type');
    }
});

ws.on('close', () => {
    console.log('Disconnected from server');
});
