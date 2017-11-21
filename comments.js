const WebSocketServer = new require('ws');
const webSocketPort = 8081;
const errorText = 'На сервер пришли невалидные данные, сообщение не отправлено!';
const {correctTime} = require('./src/js/utils/index');

// подключенные клиенты
let clients = {};
const createTimeString = () =>{
  const date = new Date();
  const minutes = correctTime(date.getMinutes());
  const hour = date.getHours();
  return `${hour}:${minutes}`;
};

const dataManipulation = message => {
  try {
    const data = JSON.parse(message);
    const time = createTimeString();
    data.push(time);
    return data;
  } catch(e) {
    console.warn(e);
    return false;
  }
};
// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
  port: webSocketPort
});

webSocketServer.on('connection', function(ws) {
  const id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);
    message = dataManipulation(message);
    if (message) {
      for (let key in clients) {
        clients[key].send(JSON.stringify(message));
      }
    } else {
      console.info(errorText)
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});