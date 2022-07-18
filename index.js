function showLoginView() {
  const main = document.querySelector("#main");
  main.innerHTML = `
    <div class="flex flex-col gap-2 items-center">
      <h2 class="p-2 text-2xl font-bold">Login</h2>
      <div class="w-7/12 flex flex-col gap-2">
        <input class="border border-sky-300 p-2" type="text" id="email" placeholder="Enter your Email">
        <input class="border border-sky-300 p-2" type="password" id="password" placeholder="Enter your Password">
        <button class="p-2 font-bold text-white bg-blue-600 transition-colors hover:bg-blue-800">Login</button>
        <a class="p-1 flex gap-2 items-center bg-blue-500 transition-colors hover:bg-blue-600" href="http://localhost:4000/api/auth/google">
          <img class="w-10 h-10 p-2 bg-white" src="./img/google.svg" alt="Login with Google"></img>
          <span class="font-bold text-white">Login with Google</span>
        </a>
      </div>
    </div>
  `;
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