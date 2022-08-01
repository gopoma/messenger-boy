"use strict";
const production = false;
const BASE_URL = production ? "" : "http://localhost:4000";
let user = {}; // Filled when Validation or Login or SignUp goes successfully
let socket;
let destiny = {};
let currentChatID;
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
      <div class="w-10/12">
        <div id="lookingAt" style="height:7.5vh;" class="flex items-center"></div>
        <div id="messages" style="height:70.7vh;" class="overflow-auto flex flex-col gap-1 bg-white"></div>
        <div id="imgPreview"></div>
        <div class="flex items-center bg-white">
          <input id="messageImgInput" class="hidden" type="file">
          <button title="Add an Image" class="rounded-full p-2 flex justify-center items-center hover:bg-slate-200" onclick="document.querySelector('#messageImgInput').click();">
            <svg viewBox="0 -1 17 17" height="20px" width="20px" class="a8c37x1j ms05siws hr662l2t b7h9ocf4"><g fill="none" fill-rule="evenodd"><path d="M2.882 13.13C3.476 4.743 3.773.48 3.773.348L2.195.516c-.7.1-1.478.647-1.478 1.647l1.092 11.419c0 .5.2.9.4 1.3.4.2.7.4.9.4h.4c-.6-.6-.727-.951-.627-2.151z" fill="#0084ff"></path><circle fill="#0084ff" cx="8.5" cy="4.5" r="1.5"></circle><path d="M14 6.2c-.2-.2-.6-.3-.8-.1l-2.8 2.4c-.2.1-.2.4 0 .6l.6.7c.2.2.2.6-.1.8-.1.1-.2.1-.4.1s-.3-.1-.4-.2L8.3 8.3c-.2-.2-.6-.3-.8-.1l-2.6 2-.4 3.1c0 .5.2 1.6.7 1.7l8.8.6c.2 0 .5 0 .7-.2.2-.2.5-.7.6-.9l.6-5.9L14 6.2z" fill="#0084ff"></path><path d="M13.9 15.5l-8.2-.7c-.7-.1-1.3-.8-1.3-1.6l1-11.4C5.5 1 6.2.5 7 .5l8.2.7c.8.1 1.3.8 1.3 1.6l-1 11.4c-.1.8-.8 1.4-1.6 1.3z" stroke="#0084ff" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
          </button>
          <input id="messageInput" class="w-full p-2 border border-sky-300" type="text" placeholder="Enter a message">
        </div>
      </div>
    </div>
  `;

  const messageImgInput = document.querySelector("#messageImgInput");
  messageImgInput.addEventListener("change", evt => {
    const [file] = messageImgInput.files;
    if(file) {
      const imgPreview = document.querySelector("#imgPreview");
      const previewSource = URL.createObjectURL(file);
      imgPreview.innerHTML = `
        <div class="max-w-max relative">
          <img class="w-20 h-20" src="${previewSource}">
          <button onclick="clearImgInput()" class="absolute top-0 right-0 p-1 text-lg font-bold bg-white hover:bg-slate-200">✘</button>
        </div>
      `;
    } else {
      renderMessages(["A wild Error has appeared!"]);
    }
  });

  const messageInput = document.querySelector("#messageInput");
  messageInput.addEventListener("keypress", async evt => {
    if(evt.keyCode === 13) {
      if(Object.keys(destiny).length !== 0 && messageInput.value.trim()) {
        sendMessage({isFile:false});
        messageInput.value = "";
      }

      const [file] = messageImgInput.files;
      if(file) {
        const {location} = await uploadFile("messageImgInput");
        messageInput.value = `
          <img class="w-36 h-36" src="${location}">
        `;
        sendMessage({isFile:true});
        messageInput.value = "";
        clearImgInput();
      }
    }
  });

  showChannels();
}

function clearImgInput() {
  document.querySelector("#imgPreview").innerHTML = "";
  document.querySelector("#messageImgInput").value = null;
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
      const messages = chat.messages;
      const read = messages.length !== 0 && messages[messages.length - 1].idSender !== user.id ? messages[messages.length - 1]?.read : true;
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
    currentChatID = chat._id;
    if(chat.messages[chat.messages.length - 1]?.idSender !== user.id) {
      socket.emit("readChat", chat._id);
    }
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
  const messagesComponent = document.querySelector("#messagesComponent");
  messagesComponent.innerHTML = "";
  messages.forEach(message => {
    messagesComponent.innerHTML += `
      <div class="z-[125] p-3 flex gap-4 justify-between items-center text-red-700 bg-red-100">
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
          <label class="w-2/12 font-bold">Location:</label>
          <div class="w-10/12 flex gap-2">
            <input class="w-1/3 border border-sky-300 p-2" type="text" id="state" placeholder="State">
            <input class="w-1/3 border border-sky-300 p-2" type="text" id="city" placeholder="City">
            <input class="w-1/3 border border-sky-300 p-2" type="text" id="district" placeholder="District">
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <label class="font-bold">Profile Picture:</label>
          <input class="p-2" type="file" id="profilePic" placeholder="Profile Picture">
        </div>
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

async function uploadFile(idFileInput) {
  try {
    const fileInput = document.querySelector(`#${idFileInput}`);

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
  
    const url = `${BASE_URL}/api/files`;
    const response = await fetch(url, {
      method: "POST", 
      body: formData,
      credentials: "include"
    });
    return await response.json();
  } catch(error) {
    console.log(error);
  }
}

async function doSignUp() {
  const name = document.querySelector("#name");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const passwordConfirmation = document.querySelector("#passwordConfirmation");
  const state = document.querySelector("#state");
  const city = document.querySelector("#city");
  const district = document.querySelector("#district");
  let profilePic = "";

  if(password.value !== passwordConfirmation.value) {
    password.value = "";
    passwordConfirmation.value = "";
    renderMessages(["Passwords don't match"]);
    return;
  }

  const result = await uploadFile("profilePic");
  if(result) {
    profilePic = result.location;
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
      profilePic: profilePic
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
  .then(() => {+
    socket.disconnect();
    user = {};
    showHome();
    showRegularMenu();
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
    const {senderID, senderName, senderProfilePic, chat, content} = messageData;

    // We have to grant the user that has sent the last message
    if(lookingAtChats) {
      showChannels();

      const lookingAtHasSentMessage = senderID === destiny._id;
      if(lookingAtHasSentMessage) {
        renderSocketMessages(chat);
        const messagesComponent = document.querySelector("#messages");
        messagesComponent.scrollTop = messagesComponent.scrollHeight;
      } else {
        console.log("Another target than lookingAt has sent a message");
      }

      if(senderID === destiny._id) {
        socket.emit("readChat", currentChatID);
      }
    } else {
      console.log("You are not in chats!:", content);
    }
  });
  
  socket.on("messageSended", chat => {
    showChannels();
    renderSocketMessages(chat);
    const messagesComponent = document.querySelector("#messages");
    messagesComponent.scrollTop = messagesComponent.scrollHeight;
  });

  socket.on("messages", chat => {
    renderSocketMessages(chat);
    const messagesComponent = document.querySelector("#messages");
    messagesComponent.scrollTop = messagesComponent.scrollHeight;
  })

  socket.on("readChat", () => {
    showChannels();
  });

  socket.on("messageDeleted", chat => {
    renderSocketMessages(chat);
  });

  socket.on("messageDeletedNotification", chatData => {
    const { senderID, chat } = chatData;
    if(lookingAtChats && senderID === destiny._id) {
      renderSocketMessages(chat);
    }
  });

  socket.on("messageEdited", chat => {
    renderSocketMessages(chat);
  });

  socket.on("messageEditedNotification", chatData => {
    const { senderID, chat } = chatData;
    if(lookingAtChats && senderID === destiny._id) {
      renderSocketMessages(chat);
    }
  });
}

function renderSocketMessages(chat) {
  const messagesComponent = document.querySelector("#messages");
  messagesComponent.innerHTML = "";
  chat.messages.forEach(message => {
    const createdAt = new Date(message.createdAt);

    const date = createdAt.getDate();
    const isToday = date === new Date().getDate();
    const month = createdAt.getMonth();
    const year = createdAt.getFullYear();

    const hours = createdAt.getHours();
    const minutes = createdAt.getMinutes() < 10 ? `0${createdAt.getMinutes()}` : createdAt.getMinutes();
    const messageDate = `${isToday ? `${"Today"}` : `${date}/${month}/${year}`} ${hours}:${minutes} hrs.`;
    let downloadComponent = "";
    let contentComponent = message.content;

    if(message.isFile) {
      const [, location] = message.content.match(/^.*src="(.*)".*$/);
      contentComponent = `<div onclick="showFullImgModal('${location}')" class="cursor-pointer">${message.content}</div>`;
      downloadComponent = `<p onclick="downloadFile('${location}')" class="p-2 cursor-pointer hover:bg-slate-800">Descargar</p>`;
    }

    const sender = message.idSender === user.id;
    if(message.isDeleted) {
      messagesComponent.innerHTML += `
        <div class="flex ${sender ? 'justify-end mr-4' : 'justify-start ml-4'}">
          <div class="relative rounded-md p-2 ${isToday ? 'pr-[120px]' : 'pr-[145px]'} ${sender ? 'text-white' : 'text-black'} ${sender ? 'bg-blue-500' : 'bg-gray-300'}">
            <p class="italic flex gap-2 items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class=""><path fill-rule="evenodd" clip-rule="evenodd" d="M7.759 6.43a7 7 0 0 1 9.81 9.81l-9.81-9.81ZM6.357 7.858a7 7 0 0 0 9.786 9.786L6.357 7.857ZM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" fill="currentColor"></path></svg>
              <span>${sender ? "You've deleted this message" : "This message has been deleted"}</span>
            </p>
            <p class="absolute 'pr-1 bottom-0 right-0 text-sm">${messageDate}</p>
          </div>
        </div>
      `;
    } else {
      messagesComponent.innerHTML += `
        <div class="flex ${sender ? 'justify-end mr-4' : 'justify-start ml-4'}">
          <div class="relative rounded-md p-2 ${message.isFile ? '' : `${isToday ? 'pr-[120px]' : 'pr-[145px]'}`} ${sender ? 'text-white' : 'text-black'} ${sender ? 'bg-blue-500' : 'bg-gray-300'}">
            ${contentComponent}
            <p class="absolute ${message.isFile ? 'rounded-md bg-slate-700 p-1 text-white' : 'pr-1'} bottom-0 right-0 text-sm">${messageDate}</p>

            ${sender || message.isFile ? `
              <div onclick="toggleDropdownOptions('${message._id}')" class="absolute top-0 -right-4 opacity-75 rounded-full bg-slate-600 cursor-pointer">
                <img class="w-7 h-7" src="./img/arrow-down.svg">
              </div>`
            : ""}
            <div id="message-options-${message._id}" class="hidden z-20 absolute top-5 -right-4 min-w-max	py-2 text-white bg-slate-700">
              ${downloadComponent}
              ${sender ? 
                `${!message.isFile ?
                  `<p onclick="showEditModal('${encodeURIComponent(JSON.stringify(message))}')" class="p-2 cursor-pointer hover:bg-slate-800">Editar mensaje</p>`
                  : ""}
                  <p onclick="showDeleteModal('${encodeURIComponent(JSON.stringify(message))}')" class="p-2 cursor-pointer hover:bg-slate-800">Eliminar mensaje</p>` 
              : ""}
            </div>
          </div>
        </div>
      `;
    }
  });
}

function showFullImgModal(location) {
  document.querySelector("#modal").classList.add("modal--show");
  document.querySelector("#modal").innerHTML = `
    <div class="modal__content">
      <img class="border-4 border-black w-96 h-96" src="${location}">
    </div>
  `;

  const modal = document.querySelector("#modal");
  const handleOutsideClick = evt => {
    if(evt.target.classList.contains("modal")) {
      modal.classList.remove("modal--show");
      modal.removeEventListener("click", handleOutsideClick, true);
    }
  }
  modal.addEventListener("click", handleOutsideClick, true);
}

function closeGenericModal() {
  document.querySelector("#modal").classList.remove("modal--show");
}

function toggleDropdownOptions(idMessage) {
  document.querySelector(`#message-options-${idMessage}`).classList.toggle("hidden");
}

function downloadFile(location) {
  fetch(location)
  .then(response => response.blob())
  .then(blob => {
    const [, fileName] = location.match(/^.*\/MessengerBoy\/(.*)\..*$/);
    const href = URL.createObjectURL(blob);
    const hiddenAnchor = Object.assign(document.createElement("a"), {
      href,
      class: "hidden",
      download: fileName
    });
    document.body.appendChild(hiddenAnchor);

    hiddenAnchor.click();
    URL.revokeObjectURL(href);
    hiddenAnchor.remove();
  })
  .catch(console.log)
}

function showEditModal(messageData) {
  const message = JSON.parse(decodeURIComponent(messageData));

  document.querySelector("#modal").classList.add("modal--show");
  document.querySelector("#modal").innerHTML = `
    <div id="modalContent" class="modal__content bg-slate-200">
      <div class="flex justify-end items-center">
        <div onclick="closeGenericModal()" class="right-0 px-3 py-1 text-lg text-white bg-red-600 hover:bg-red-800 cursor-pointer transition-colors">✘</div>
      </div>
      <div class="p-4 flex flex-col gap-2">
        <h4 class="text-lg font-bold text-center">Edit Message</h4>
        <div class="flex flex-col gap-2">
          <textarea id="messageEditInput" class="border border-sky-300 p-2" cols="49" rows="3">${message.content}</textarea>
          <div class="flex gap-2 justify-end">
            <button id="btnEdit" onclick="doEditMessage('${message._id}')" class="rounded px-3 py-2 font-bold text-white bg-blue-600 hover:bg-blue-800 cursor-pointer transition-colors">Edit</button>
            <button onclick="closeGenericModal()" class="rounded px-3 py-2 font-bold text-white bg-slate-600 hover:bg-slate-800 cursor-pointer transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#messageEditInput").addEventListener("keypress", evt => {
    if(evt.keyCode === 13) {doEditMessage(message._id);}
  });
}

function doEditMessage(idMessage) {
  const content = document.querySelector("#messageEditInput").value;
  if(!content) {
    renderMessages(["Please, provide message content"])
    return;
  }

  socket.emit("editMessage", idMessage, content);
  document.querySelector("#modal").classList.remove("modal--show");
}

function showDeleteModal(messageData) {
  const message = JSON.parse(decodeURIComponent(messageData));

  document.querySelector("#modal").classList.add("modal--show");
  document.querySelector("#modal").innerHTML = `
    <div id="modalContent" class="modal__content bg-slate-200">
      <div class="flex justify-end items-center">
        <div onclick="closeGenericModal()" class="right-0 px-3 py-1 text-lg text-white bg-red-600 hover:bg-red-800 cursor-pointer transition-colors">✘</div>
      </div>
      <div class="p-4 flex flex-col gap-2">
        <p>Are you sure you want to delete this message?</p>
        <div class="flex gap-2 justify-end align-items-center">
          <button onclick="doDeleteMessage('${message._id}')" class="rounded px-3 py-2 text-white font-bold bg-red-600 hover:bg-red-800 cursor-pointer transition-colors">Delete</button>
          <button onclick="closeGenericModal()" class="rounded px-3 py-2 text-white font-bold bg-slate-600 hover:bg-slate-800 cursor-pointer transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function doDeleteMessage(idMessage) {
  socket.emit("deleteMessage", idMessage);
  document.querySelector("#modal").classList.remove("modal--show");
}

function sendMessage({isFile}) {
  const messageInput = document.querySelector("#messageInput");
  socket.emit("sendMessage", messageInput.value, isFile);
}
