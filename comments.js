const WebSocketServer = new require('ws');
const webSocketPort = 8081;

// подключенные клиенты
let clients = {};

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

    for (let key in clients) {
      clients[key].send(message);
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});