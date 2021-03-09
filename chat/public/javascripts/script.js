const ws = new WebSocket("ws://localhost:3000");


ws.onmessage = (msg) => {
  renderMessages(JSON.parse(msg.data));
};

const renderMessages = (data) => {
  
  let html='';
		data.forEach((message)=>{ html+=`<p>${message.message}</p>`});
		document.getElementById('messages').innerHTML = html;
};



const handleSubmit = (evt) => {
  evt.preventDefault();
  const message = document.getElementById("message");
  const author = document.getElementById("author"); 
  
  let values = {
    message: message.value,
    author: author.value
  }
  json = JSON.stringify(values);
  ws.send(json);
  message.value = "";
  author.value= "";
  
};

const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);

