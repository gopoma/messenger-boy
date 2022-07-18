const socket = io.connect("http://localhost:4000");

function connect() {
  const username = document.querySelector("#username");

  socket.emit("active", username.value);
}

socket.on("userConnected", activeUsers => {
  console.log(activeUsers);
});

socket.on("userDisconnected", activeUsers => {
  console.log(activeUsers);
});

function sendMessage() {
  const message = document.querySelector("#message");

  socket.emit("sendMessage", message.value);
}

socket.on("messageReceived", messages => {
  console.log(messages);
});