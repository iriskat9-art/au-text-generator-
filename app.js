let chats = {};
let characters = [];
let currentChat = null;

const messagesBox = document.getElementById("messages");



// запуск

window.onload = function(){
    renderChats();
    renderCharacters();
};



// ---------- ЧАТЫ ----------


function newChat(){

    let name = document.getElementById("chatName").value.trim();

    if(!name) return;


    chats[name] = [];


    renderChats();

    openChat(name);


    document.getElementById("chatName").value = "";

}



function renderChats(){

    let box = document.getElementById("chatList");

    box.innerHTML = "";


    Object.keys(chats).forEach(name=>{


        let div = document.createElement("div");

        div.className = "chat-item";


        let button = document.createElement("button");

        button.innerText = name;

        button.onclick = () => openChat(name);


        div.appendChild(button);

        box.appendChild(div);


    });


}



function openChat(name){

    currentChat = name;


    document.getElementById("chatTitle").innerText = name;


    messagesBox.innerHTML = "";


    chats[name].forEach(msg=>{

        showMessage(msg);

    });


}



function deleteCurrentChat(){

    if(!currentChat) return;


    delete chats[currentChat];


    currentChat = null;


    messagesBox.innerHTML = "";


    document.getElementById("chatTitle").innerText="Новый чат";


    renderChats();

}







// ---------- ПЕРСОНАЖИ ----------



function addCharacter(){

    let input = document.getElementById("characterName");

    let name = input.value.trim();


    if(!name) return;


    characters.push(name);


    renderCharacters();


    input.value="";

}




function renderCharacters(){

    let select = document.getElementById("characterSelect");


    select.innerHTML =
    "<option>Выбери персонажа</option>";



    characters.forEach(name=>{


        let option=document.createElement("option");

        option.value=name;

        option.innerText=name;


        select.appendChild(option);


    });


}







// ---------- СООБЩЕНИЯ ----------



function sendMessage(){


    if(!currentChat) return;


    let author =
    document.getElementById("characterSelect").value;


    let text =
    document.getElementById("messageText").value.trim();


    let type =
    document.getElementById("type").value;



    if(!text) return;



    chats[currentChat].push({

        author: author,

        text: text,

        type: type

    });



    openChat(currentChat);


    document.getElementById("messageText").value="";


}







function showMessage(msg){


    let div = document.createElement("div");



    if(msg.type === "me"){


        div.className="message me";


        div.innerHTML = `

        <div class="bubble my-bubble">
        ${msg.text}
        </div>

        `;


    } else {


        div.className="message";


        div.innerHTML = `

        <div class="avatar">
        ${msg.author[0]}
        </div>


        <div>

        <div class="name">
        ${msg.author}
        </div>


        <div class="bubble other-bubble">
        ${msg.text}
        </div>


        </div>

        `;

    }


    messagesBox.appendChild(div);

}