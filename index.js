function showLoginView() {
  console.log("Login View");
}

let socket;

function connectSocket() {
  socket = io.connect("http://localhost:4000", {
    withCredentials: true
  });

  socket.emit("userConnected");

  socket.on("userConnected", activeUsers => {
    console.log(activeUsers);
  });
  
  socket.on("userDisconnected", activeUsers => {
    console.log(activeUsers);
  });

  socket.on("messageReceived", messages => {
    console.log(messages);
  });
  
  socket.on("messageSended", messages => {
    console.log(messages);
  });

  socket.on("messages", messages => {
    console.log(messages);
  })
}

fetch("http://localhost:4000/api/auth/validate", {
  credentials: "include"
})
.then(response => {
  if(response.ok) {
    return response.json();
  }

  // throw new Error("Not Allowed");
})
.then(() => {
  connectSocket();
})
.catch(console.log)

function doLogin() {
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  
  fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    }),
    credentials: "include"
  })
  .then(response => {
    if(response.ok) {
      return response.json();
    }

    // throw new Error("Not Allowed");
  })
  .then(() => {
    connectSocket();
  })
  .catch(console.log());
}

function doLogout() {
  fetch("http://localhost:4000/api/auth/logout", {
    credentials: "include"
  })
  .then(response => response.json())
  .then(console.log)
  .catch(console.log)
}

function beginChat() {
  const idChat = document.querySelector("#idChat");
  socket.emit("beginChat", idChat.value);
}

function sendMessage() {
  const message = document.querySelector("#message");
  socket.emit("sendMessage", message.value);
}