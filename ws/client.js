const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5000');

const action = 'join_chat';
const existingKey = 'ваш_ключ_здесь'; 

ws.on('open', () => {
  console.log("Connected to server");

  if (action === 'new_chat') {
    ws.send(JSON.stringify({ type: 'new_chat' }));
  } else if (action === 'join_chat') {
    ws.send(JSON.stringify({ type: 'join_chat', key: existingKey }));
  }
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  if (message.type === 'session_key') {
    console.log(`Ваш ключ сессии: ${message.key}`);

    setTimeout(() => {
      ws.send(JSON.stringify({ type: 'message', message: "Hello to all on this session!" }));
    }, 1000);
  }
  
  if (message.type === 'joined') {
    console.log(message.message);

    setTimeout(() => {
      ws.send(JSON.stringify({ type: 'message', message: "Hello to all in the existing session!" }));
    }, 1000);
  }

  if (message.type === 'error') {
    console.log(`Ошибка: ${message.message}`);
  }

  if (message.type === 'chat_message') {
    console.log(`Получено сообщение: ${message.message}`);
  }
});
