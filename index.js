"use strict";
const production = false;
const BASE_URL = production ? "" : "http://localhost:4000";
let user = {}; // Filled when Validation or Login or SignUp goes successfully
let socket;
let destiny = {};
let lookingAtChats = false;

window.addEventListener("load", showHome);
function showHome() {
  lookingAtChats = false;
  const main = document.querySelector("#main");
  main.innerHTML = `
    <div class="flex justify-center items-center">
      <div class="p-4 flex flex-col gap-2 bg-white">
        <h2 class="text-lg font-bold">Bienvenido ${user.name ?? ""}</h2>
        <p>Este sistema fue desarrollado haciendo uso de la Arquitectura Orientada a Servicios (SOA).</p>
        <p>El sistema fué desarrollado usando estas tecnologías:</p>
        <ul class="ml-5 list-disc">
          <li>HTML y el Framework <strong>TailwindCSS</strong> para el CSS.</li>
          <li><strong>Vanilla Javascript</strong> para el Frontend.</li>
          <li><strong>NodeJS</strong> para el backend a través del framework <strong>Express</strong>.</li>
          <li><strong>MongoDB</strong> para la base de datos.</li>
          <li>El ODM <strong>Mongoose</strong> para la validación y modelado de objetos en el modelo.</li>
          <li><strong>Passport</strong> para el inicio de sesión con redes sociales.</li>
          <li><strong>HttpOnly Cookies</strong> para el control de flujo en la autenticación.</li>
          <li><strong>busboy</strong> para el consumo de Streams.</li>
          <li><strong>Cloudinary</strong> para el almacenamiento de archivos.</li>
          <li><strong>Socket.io</strong> para la comuniación en Tiempo Real.</li>
          <li>La comunicación entre el cliente y el servidor se hizo usando JSON de manera asíncrona.</li>
          <li>El despliegue del backend fue realizado en <strong>Heroku</strong>.</li>
          <li>El despliegue del frontend fue realizado en <strong>Vercel</strong>.</li>
        </ul>
      </div>
    </div>
  `;
}

// Auth Validation when refreshing
fetch(`${BASE_URL}/api/auth/validate`, {credentials:"include"})
.then(response => response.json())
.then(data => {
  if(data.success) {
    user = data.user;
    connectSocket();
    showMenuUserLogged();
  } else {
    showRegularMenu();
  }
})
.catch(console.log)

function showRegularMenu() {
  const menu = document.querySelector("#menu");
  menu.innerHTML = `
    <p onclick="showHome()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">Home</p>
    <p onclick="showLoginView()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">Login</p>
    <p onclick="showSignUpView()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">SignUp</p>
  `;
}

function showMenuUserLogged() {
  const menu = document.querySelector("#menu");
  menu.innerHTML = `
    <p onclick="showHome()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">Home</p>
    <p onclick="showMyChats()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">My Chats</p>
    <p onclick="showUserData()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">Show Data</p>
    <div class="relative">
      <p onclick="toggleUserActions()" class="rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-slate-600">${user.name}</p>
      <div id="userActions" class="hidden absolute">
        <div class="flex flex-col">
          <p onclick="doLogout()" class="z-20 p-2 font-bold text-white bg-red-600 hover:bg-red-800 cursor-pointer transition-colors">Logout</p>
        </div>
      </div>
    </div>
  `;
  showHome();
}

function showMyChats() {
  lookingAtChats = true;
  destiny = {};
  const main = document.querySelector("#main");
  main.innerHTML = `
    <div style="min-height:83.5vh;" class="relative flex">
      <div class="w-2/12 bg-gray-100">
        <div class="py-2 flex justify-center items-center">
          <input oninput="showSearchResults()" class="w-11/12 rounded-md p-2 bg-slate-200" type="search" id="queryName" placeholder="Search in MessengerBoy">
        </div>
        <div id="userSearchResults" class="absolute w-2/12"></div>
        <div id="channels"></div>
      </div>
      <div class="w-10/12 bg-slate-200">
        <div id="lookingAt" style="height:7.5vh;" class="flex items-center"></div>
        <div id="messages" style="height:70.7vh;" class="overflow-auto bg-white"></div>
        <input id="messageInput" class="w-full p-2 border border-sky-300" type="text" placeholder="Enter a message">
      </div>
    </div>
  `;

  const messageInput = document.querySelector("#messageInput");
  messageInput.addEventListener("keypress", evt => {
    if(Object.keys(destiny).length !== 0 && messageInput.value.trim() && evt.keyCode === 13) {
      sendMessage();
      messageInput.value = "";
    }
  });

  showChannels();
}

// A channel has its id as a dataset and a channel class
function showChannels() {
  const url = `${BASE_URL}/api/chats`;
  fetch(url, {credentials:"include"})
  .then(response => response.json())
  .then(chats => {
    const channels = document.querySelector("#channels");
    channels.innerHTML = "";
    chats.forEach(chat => {
      const destiny = user.id === chat.userOne._id ? chat.userTwo : chat.userOne;
      const {read} = chat.messages[chat.messages.length - 1];
      channels.innerHTML += `
        <div id="channel-${destiny._id}" onclick="bootstrapChat('${destiny._id}')" class="channel p-2 flex gap-2 justify-center md:justify-start items-center ${read ? 'bg-white hover:bg-slate-200' : 'bg-blue-400 hover:bg-blue-600'} cursor-pointer">
          <img class="w-12 h-12" src="${destiny.profilePic}">
          <p class="hidden md:block text-lg font-bold truncate">${destiny.name}</p>
        </div>
      `;
    });
  })
  .catch(console.log)
}

function showSearchResults() {
  const queryName = document.querySelector("#queryName");
  if(!queryName.value.trim()) {
    userSearchResults.innerHTML = `
      <p class="p-2 text-lg font-bold text-center bg-white">No results found</p>
    `;
    return;
  }
  const url = `${BASE_URL}/api/users/search?name=${queryName.value}`;
  fetch(url, {credentials:"include"})
  .then(response => response.json())
  .then(users => {
    const userSearchResults = document.querySelector("#userSearchResults");
    userSearchResults.innerHTML = "";
    if(users.length !== 0) {
      users.forEach(user => {
        userSearchResults.innerHTML += `
          <div onclick="bootstrapChat('${user._id}')" class="userSearchResult p-2 flex gap-2 justify-center md:justify-start items-center bg-white hover:bg-slate-200 cursor-pointer">
            <div class="flex justify-center items-center">
              <img class="w-10 h-10" src="${user.profilePic}">
            </div>
            <p class="hidden md:block truncate">${user.name}</p>
          </div>
        `;
      });
    } else {
      userSearchResults.innerHTML = `
        <p class="p-2 text-lg font-bold text-center bg-white">No results found</p>
      `;  
    }
  })
  .catch(console.log)
}

document.addEventListener("click", evt => {
  if(!evt.target.classList.contains("userSearchResult")) {
    const userSearchResults = document.querySelector("#userSearchResults");
    if(userSearchResults) {
      userSearchResults.innerHTML = "";
    }
  }
})

function bootstrapChat(idUser) {
  const url = `${BASE_URL}/api/chats/${idUser}`;
  fetch(url, {method:"POST", credentials:"include"})
  .then(response => response.json())
  .then(chat => {
    destiny = user.id === chat.userOne._id ? chat.userTwo : chat.userOne;
    document.querySelector("#lookingAt").innerHTML = `
      <div class="p-2 flex gap-2 items-center">
        <img class="w-12 h-12" src="${destiny.profilePic}">
        <p class="text-lg font-bold">${destiny.name}</p>
      </div>
    `;
    showChannels();
    beginChat(chat._id);
  })
  .catch(console.log)
}

function beginChat(idChat) {
  socket.emit("beginChat", idChat);
}

// Debugging function
function showUserData() {
  console.log(user);
  fetch(`${BASE_URL}/api/chats`, {credentials:"include"})
  .then(response => response.json())
  .then(console.log)
  .catch(console.log)
}

function toggleUserActions() {
  document.querySelector("#userActions").classList.toggle("hidden");
}

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
      user = data.user
      connectSocket();
      showMenuUserLogged();
    } else {
      password.value = "";
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
        <button onclick="doSignUp()" class="p-2 font-bold text-white bg-blue-600 transition-colors hover:bg-blue-800" onclick="doSignUp()">SignUp</button>

        <a href="http://localhost:4000/api/auth/google" class="p-1 flex gap-2 items-center bg-blue-500 transition-colors hover:bg-blue-600">
          <img class="w-10 h-10 p-2 bg-white" src="./img/google.svg" alt="Login with Google"></img>
          <span class="font-bold text-white">SignUp with Google</span>
        </a>
        <a href="http://localhost:4000/api/auth/facebook" class="p-2 flex gap-2 items-center bg-blue-800 transition-colors hover:bg-blue-900">
          <img class="w-8 h-8" src="./img/facebook.svg">
          <span class="font-bold text-white">SignUp with Facebook</span>
        </a>
        <a href="http://localhost:4000/api/auth/twitter" class="p-2 flex gap-2 items-center bg-blue-400 transition-colors hover:bg-blue-500">
          <img class="w-8 h-8" src="./img/twitter.svg">
          <span class="font-bold text-white">SignUp with Twitter</span>
        </a>
        <a href="http://localhost:4000/api/auth/github" class="p-2 flex gap-2 items-center bg-slate-800 transition-colors hover:bg-slate-900">
          <img class="w-8 h-8" src="./img/github.svg">
          <span class="font-bold text-white">SignUp with GitHub</span>
        </a>
      </div>
    </div>
  `;
}

function doSignUp() {
  const name = document.querySelector("#name");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const passwordConfirmation = document.querySelector("#passwordConfirmation");
  const state = document.querySelector("#state");
  const city = document.querySelector("#city");
  const district = document.querySelector("#district");
  const profilePic = document.querySelector("#profilePic");

  if(password.value !== passwordConfirmation.value) {
    password.value = "";
    passwordConfirmation.value = "";
    renderMessages(["Passwords don't match"]);
    return;
  }

  const url = `${BASE_URL}/api/auth/signup`;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value,
      location: {
        state: state.value,
        city: city.value,
        district: district.value
      },
      profilePic: profilePic.value
    }),
    credentials: "include"
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      user = data.user;
      connectSocket();
      showMenuUserLogged();
    } else {
      password.value = "";
      passwordConfirmation.value = "";
      renderMessages(data.errors.map(authError => authError.message));
    }
  })
  .catch(console.log)
}

function doLogout() {
  const url = `${BASE_URL}/api/auth/logout`;
  fetch(url, {credentials:"include"})
  .then(response => response.json())
  .then(() => {
    showRegularMenu();
    socket.disconnect();
  })
  .catch(console.log)
}

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

  // destiny is the channel that we are lookingAt
  socket.on("messageReceived", messageData => {
    const {senderID, senderName, senderProfilePic, content} = messageData;

    // We have to grant the user that has sent the last message
    if(lookingAtChats) {
      showChannels();
      /* const currentChannels = Array.from(document.querySelectorAll(".channel"));
      const alreadyThere = currentChannels.find(channel => channel.id === `channel-${senderID}`);
      if(alreadyThere) {
        document.querySelector(`#channel-${senderID}`).parentNode.removeChild(alreadyThere);
      } */
  
      const lookingAtHasSentMessage = senderID === destiny._id;
      if(lookingAtHasSentMessage) {
        document.querySelector("#messages").innerHTML += `
        <div class="flex justify-start">
          <div class="rounded-md p-2 text-black bg-gray-300">${content}</div>
        </div>
        `;
      } else {
        console.log("Another target than lookingAt has sent a message");
      }

      /* const channels = document.querySelector("#channels");
      channels.innerHTML = `
        <div id="channel-${senderID}" onclick="bootstrapChat('${senderID}')" class="channel p-2 flex gap-2 justify-center md:justify-start items-center ${lookingAtHasSentMessage ? 'bg-white' : 'bg-blue-400'} hover:bg-slate-200 cursor-pointer">
          <img class="w-12 h-12" src="${senderProfilePic}">
          <p class="hidden md:block text-lg font-bold truncate">${senderName}</p>
        </div>
      ` + channels.innerHTML; */
    } else {
      console.log("You are not in chats!:", content);
    }
  });
  
  socket.on("messageSended", chat => {
    showChannels();
  });

  socket.on("messages", chat => {
    renderSocketMessages(chat);
  })
}

function renderSocketMessages(chat) {
  const messagesComponent = document.querySelector("#messages");
  messagesComponent.innerHTML = "";
  chat.messages.forEach(message => {
    const sender = message.idSender === user.id;
    messagesComponent.innerHTML += `
      <div class="flex ${sender ? 'justify-end' : 'justify-start'}">
        <div class="rounded-md p-2 ${sender ? 'text-white' : 'text-black'} ${sender ? 'bg-blue-500' : 'bg-gray-300'}">${message.content}</div>
      </div>
    `;
  });
}

function sendMessage() {
  const messageInput = document.querySelector("#messageInput");
  socket.emit("sendMessage", messageInput.value);
}