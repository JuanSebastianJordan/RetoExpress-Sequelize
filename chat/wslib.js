const WebSocket = require("ws");
const Message = require('./models/message');

const clients = [];
const messages = [];



const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();
    
    
    ws.on("message", (message) => {
      
      let json = JSON.parse(message);
      messages.push(json["message"]);
      let men = {
        ts:Date.now().toString(),
        message: json["message"],
        author: json["author"]
      };
      
      Message.create(men);
      sendMessages();
    });
  });
  
};


const sendMessages = () => {
  Message.findAll().then((response) =>{
    clients.forEach((client) => {
      client.send(JSON.stringify(response));
    });
  });
};

exports.wsConnection = wsConnection;
exports.sendMessages = sendMessages;
