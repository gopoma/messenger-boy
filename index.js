"use strict";
const production = false;
const BASE_URL = production ? "" : "http://localhost:4000";

function renderMessages(messages) {
  const messagesComponent = document.querySelector("#messages");
  messagesComponent.innerHTML = "";
  messages.forEach(message => {
    messagesComponent.innerHTML += `
      <div class="p-3 flex gap-4 justify-between items-center text-red-700 bg-red-100">
        <span>${message}</span>
        <span class="messageCloser cursor-pointer transition-colors hover:text-red-900">✘</span>
      </div>
    `;
  });

  document.querySelectorAll(".messageCloser").forEach(messageCloser => {
    messageCloser.onclick = function(evt) {
      evt.target.parentNode.parentNode.removeChild(evt.target.parentNode);
    }
  });
}

function showLoginView() {
  const main = document.querySelector("#main");
  main.innerHTML = `
    <div class="flex flex-col gap-2 items-center">
      <h2 class="p-2 text-2xl font-bold">Login</h2>
      <div class="w-7/12 lg:w-5/12 flex flex-col gap-2">
        <input class="border border-sky-300 p-2" type="text" id="email" placeholder="Enter your Email">
        <input class="border border-sky-300 p-2" type="password" id="password" placeholder="Enter your Password">
        <button onclick="doLogin()" class="p-2 font-bold text-white bg-blue-600 transition-colors hover:bg-blue-800">Login</button>

        <a href="http://localhost:4000/api/auth/google" class="p-1 flex gap-2 items-center bg-blue-500 transition-colors hover:bg-blue-600">
          <img class="w-10 h-10 p-2 bg-white" src="./img/google.svg" alt="Login with Google"></img>
          <span class="font-bold text-white">Login with Google</span>
        </a>
        <a href="http://localhost:4000/api/auth/facebook" class="p-2 flex gap-2 items-center bg-blue-800 transition-colors hover:bg-blue-900">
          <img class="w-8 h-8" src="./img/facebook.svg">
          <span class="font-bold text-white">Login with Facebook</span>
        </a>
        <a href="http://localhost:4000/api/auth/twitter" class="p-2 flex gap-2 items-center bg-blue-400 transition-colors hover:bg-blue-500">
          <img class="w-8 h-8" src="./img/twitter.svg">
          <span class="font-bold text-white">Login with Twitter</span>
        </a>
        <a href="http://localhost:4000/api/auth/github" class="p-2 flex gap-2 items-center bg-slate-800 transition-colors hover:bg-slate-900">
          <img class="w-8 h-8" src="./img/github.svg">
          <span class="font-bold text-white">Login with GitHub</span>
        </a>
      </div>
    </div>
  `;
}

function doLogin() {
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");

  const url = `${BASE_URL}/api/auth/login`;
  fetch(url, {
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
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      connectSocket();
    } else {
      renderMessages(data.errors);
    }
  })
  .catch(console.log)
}

function showSignUpView() {
  const main = document.querySelector("#main");
  main.innerHTML = `
    <div class="flex flex-col gap-2 items-center">
      <h2 class="p-2 text-2xl font-bold">SignUp</h2>
      <div class="w-7/12 lg:w-5/12 flex flex-col gap-2">
        <input class="border border-sky-300 p-2" type="text" id="name" placeholder="Enter your Name">
        <input class="border border-sky-300 p-2" type="email" id="email" placeholder="Enter a Email">
        <input class="border border-sky-300 p-2" type="password" id="password" placeholder="Enter a Password">
        <input class="border border-sky-300 p-2" type="password" id="passwordConfirmation" placeholder="Confirm your Password">
        <div class="w-full flex gap-2 items-center">
          <p class="w-2/12 p-2 font-bold">Location:</p>
          <div class="w-10/12 flex gap-2">
            <input class="w-1/3 border border-sky-300 p-2" type="text" id="state" placeholder="State">
            <input class="w-1/3 border border-sky-300 p-2" type="text" id="city" placeholder="City">
            <input class="w-1/3 border border-sky-300 p-2" type="text" id="district" placeholder="District">
          </div>
        </div>
        <input class="border border-sky-300 p-2" type="text" id="profilePic" placeholder="Profile Picture">
        <button class="p-2 font-bold text-white bg-blue-600 transition-colors hover:bg-blue-800" onclick="doSignUp()">SignUp</button>
      </div>
    </div>
  `;
}

function doSignUp() {
  console.log("Signing Up...");
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

function doLoginXD() {
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