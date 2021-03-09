const WebSocket = require("ws");
const fs = require('fs');

const clients = [];
const messages = [];
const jsonMessages = [];


const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();
    
    
    ws.on("message", (message) => {
      
      let json = JSON.parse(message);
      messages.push(json["message"]);
      let men = {
        message: json["message"],
        author: json["author"],
        ts:Date.now().toString()
      };
      
      jsonMessages.push(men);
      sendMessages();
      saveMessage();
    });
  });
  
  const saveMessage = () => {
    let data = JSON.stringify(jsonMessages, null, 2);
    fs.writeFile('message-data.json', data, (err) => {
      if (err) throw err;
      console.log('Data written to file');
    });
    
  };
  
};
/* Functions to handle the endpoints */
const addMessage = (message) => {
  messages.push(message.message);
  jsonMessages.push(message);
};
const updateMessage = (id, newMessage) => {
  
    const message = jsonMessages.find((c) => c.ts === id);
    
  for (let i = 0; i < messages.length; i++) {
    
    if(messages[i]===message.message){
      messages[i]=newMessage;
    }
  }
  for (let j = 0; j < jsonMessages.length; j++) {
    const element = jsonMessages[j];
    if(jsonMessages[j].message===message.message){
      jsonMessages[j].message = newMessage;
    }
  }
  
};

const deleteMessage = (id) => { 
    const message = jsonMessages.find((c) => c.ts === id);
    
    for (let i = 0; i < messages.length; i++) {
      const element = messages[i];
      if(messages[i]===message.message){
        messages.splice(i,1);
        i--;
      }
    }
    for (let i = 0; i < jsonMessages.length; i++) {
      const element = jsonMessages[i];
      if(jsonMessages[i].message===message.message){
        jsonMessages.splice(i,1);
        i--;
      }
    }

};

const sendMessages = () => {
  clients.forEach((client) => {
    client.send(JSON.stringify(messages));
  });
};

exports.wsConnection = wsConnection;
exports.sendMessages = sendMessages;
exports.addMessage = addMessage;
exports.updateMessage = updateMessage;
exports.deleteMessage = deleteMessage;
