const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); 

const wss = new WebSocket.Server({ port: 5000 });
const sessions = {};

console.log('WebSocket сервер запущен на порту 5000');

wss.on('connection', (ws) => {
  let sessionKey = null;
  let nickname = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'new_chat') {
      sessionKey = uuidv4(); 
      nickname = data.nickname;

      ws.send(JSON.stringify({ type: 'session_key', key: sessionKey }));

      if (!sessions[sessionKey]) {
        sessions[sessionKey] = [];
      }
      sessions[sessionKey].push({ ws, nickname });
      console.log(`Новый чат создан с ключом: ${sessionKey}`);
    }

    else if (data.type === 'join_chat') {
      sessionKey = data.key;

      if (sessions[sessionKey]) {
        nickname = `Guest_${Math.floor(Math.random() * 1000)}`; 
        sessions[sessionKey].push({ ws, nickname });
        ws.send(JSON.stringify({ type: 'joined', message: `Подключен к чату с ключом: ${sessionKey}` }));
        console.log(`Пользователь подключился к чату с ключом: ${sessionKey}`);
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Чат с таким ключом не найден' }));
      }
    }

    else if (data.type === 'message' && sessionKey && sessions[sessionKey]) {
      const messageToSend = JSON.stringify({ type: 'chat_message', message: data.message, nickname: nickname });
      
      sessions[sessionKey].forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(messageToSend);
        }
      });
      console.log(`Сообщение отправлено всем по ключу ${sessionKey}: ${data.message}`);
    }
  });

  ws.on('close', () => {
    if (sessionKey && sessions[sessionKey]) {
      sessions[sessionKey] = sessions[sessionKey].filter(client => client.ws !== ws);
      console.log(`Клиент отключен от ключа ${sessionKey}`);
      
      if (sessions[sessionKey].length === 0) {
        delete sessions[sessionKey];
        console.log(`Сессия с ключом ${sessionKey} удалена`);
      }
    }
  });
});
