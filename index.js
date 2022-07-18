const socket = io.connect("http://localhost:4000");

function connect() {
  const idUser = document.querySelector("#idUser");

  document.querySelector("#currentUserId").innerText = idUser.value;
  document.querySelector("#currentSocketId").innerText = socket.id;
  socket.emit("userConnected", idUser.value);
}

socket.on("userConnected", activeUsers => {
  console.log(activeUsers);
});

socket.on("userDisconnected", activeUsers => {
  console.log(activeUsers);
});

function sendMessage() {
  const idSocket = document.querySelector("#idSocket");
  const message = document.querySelector("#message");

  socket.emit("sendMessage", idSocket.value, message.value);
}

socket.on("messageReceived", messages => {
  console.log(messages);
});

socket.on("messageSended", messages => {
  console.log(messages);
});