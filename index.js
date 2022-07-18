const socket = io.connect("http://localhost:4000", {
  withCredentials: true
});

fetch("http://localhost:4000/api/auth/validate", {
  credentials: "include"
})
.then(response => response.json())
.then(console.log)
.catch(console.log)

function doLogout() {
  fetch("http://localhost:4000/api/auth/logout", {
    credentials: "include"
  })
  .then(response => response.json())
  .then(console.log)
  .catch(console.log)
}

function connect() {
  const idUser = document.querySelector("#idUser");

  document.querySelector("#currentUserId").innerText = idUser.value;
  document.querySelector("#currentSocketId").innerText = socket.id;
  socket.emit("userConnected");
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