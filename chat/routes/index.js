var express = require('express');
var router = express.Router();
const Joi = require("joi");
const ws = require('../wslib');
const Message = require('../models/message');
const { response } = require('express');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET all messages. */
router.get('/chat/api/messages', function(req, res, next){
  Message.findAll().then((response) => {
    res.send(response);
  });
});

/* GET message by id. */
router.get('/chat/api/messages/:id', function(req, res, next){
  id = req.params.id;
  Message.findByPk(id).then((response) => {
    if(response === null){
      return res.status(404).send('The message with the given TS was not found!')
    }
    res.send(response);
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
  Message.create(message).then((response) => {
    res.send(response);
    ws.sendMessages();
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
  Message.update(req.body, { where: {ts: id }}).then((response) => {
    if(response[0] !== 0) {
      res.send({message: 'Message updated'});
      ws.sendMessages();
    }
    else res.status(404).send({message: 'Message with the given id was not found!'});
  });
});

/* DELETE a message by id. */
router.delete('/chat/api/messages/:id', function(req, res, next){
  id = req.params.id;
  Message.destroy({
    where: {
      ts: id,
    },
  }).then((response) => {
    console.log(response);
    if(response===1) {
      res.status(200).send({message:'Message deleted!'});
      ws.sendMessages();
    }
    else res.status(404).send({message: 'Message with the given id was not found!'});
  });
});

module.exports = router;
