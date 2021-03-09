var express = require('express');
var router = express.Router();
const fs = require('fs');
const Joi = require("joi");
const ws = require('../wslib');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET all messages. */
router.get('/chat/api/messages', function(req, res, next){
  fs.readFile('message-data.json', (err, data) => {
    if (err) throw err;
    //console.log('Data: '+data);
    //let messages = JSON.parse(data);
    //console.log('Messages: '+ messages);
    res.send('Get all messages: '+ data);
});
});

/* GET message by id. */
router.get('/chat/api/messages/:id', function(req, res, next){
  id = req.params.id;
  
  fs.readFile('message-data.json', (err, data) => {
    if (err) throw err;
    let messages = JSON.parse(data);
    //const message = data.find((c) => c.ts === req.params.id);
    men = null;
    for (let i = 0; i < messages.length; i++) {
      const act = messages[i];
      if(act.ts === id){
        men=act;
      }
    }
    
    if(men==null){
      return res.status(404).send("The message with the given TS was not found");
    }
    ans = JSON.stringify(men);
    res.send('Message: '+ ans);
});
});

/* POST a new message. */
router.post('/chat/api/messages', function(req, res, next){
  message = {
    'message': req.body.message,
    'author': req.body.author,
    'ts': req.body.ts
  };
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().regex(/([\wáéíóú]{1,}[\s]{1,}[\wáéíóú]{1,}[\s]{0,}){1,}/).min(1).required(),
    ts: Joi.string().min(5).required(),
  });
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).send('The input is not in the valid format');
  }
  ws.addMessage(message);
  ws.sendMessages();
  fs.readFile('message-data.json', (err, data) => {
    if (err) throw err;
    let messages = JSON.parse(data);
    messages.push(message);
    json = JSON.stringify(messages, null, 2);
    fs.writeFile('message-data.json', json, (err) => {
      if (err) throw err;
      console.log('Data written to file');
      res.send('Message send!')
    });
  });
});

/* PUT update message by id. */
router.put('/chat/api/messages/:id', function(req, res, next){
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().regex(/([\wáéíóú]{1,}[\s]{1,}[\wáéíóú]{1,}[\s]{0,}){1,}/).min(1).required(),
  });
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).send('The input is not in the valid format');
  }
  id = req.params.id;
  
  fs.readFile('message-data.json', (err, data) => {
    if (err) throw err;
    let messages = JSON.parse(data);
    men=null;
    for (let i = 0; i < messages.length; i++) {
      let element = messages[i];
      if(element.ts === id){
        messages[i].message=req.body.message;
        men=element;
      }
    }
    if(men==null){
      return res.status(404).send("The message with the given TS was not found");
    }
    ws.updateMessage(id, req.body.message);
    ws.sendMessages();
    ans = JSON.stringify(messages, null, 2);
    fs.writeFile('message-data.json', ans, (err) => {
      if (err) throw err;
      console.log('Data written to file');
      res.send('Message updated!')
    });
  });
});

/* DELETE a message by id. */
router.delete('/chat/api/messages/:id', function(req, res, next){
  id = req.params.id;
  fs.readFile('message-data.json', (err, data) => {
    if (err) throw err;
    let messages = JSON.parse(data);
    let newArr = messages.filter(function (value, index, messages){
      return value.ts != id;  
    });
    if(newArr.length != messages.length){
      ws.deleteMessage(id);
      ws.sendMessages();
      ans = JSON.stringify(newArr, null, 2);
      fs.writeFile('message-data.json', ans, (err) => {
        if (err) throw err;
        console.log('Data written to file');
        res.send('Message deleted!')
      });
    }
    else{
      return res.status(404).send("The message with the given TS was not found");
    }
});
});
module.exports = router;
