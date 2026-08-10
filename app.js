let chats = {};
let characters = [];
let currentChat = null;

const messagesBox = document.getElementById("messages");
const STORAGE_KEY = "auGeneratorData";

function saveData(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, characters }));
}

function loadData(){
    try{
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if(saved){
            chats = saved.chats || {};
            characters = (saved.characters || []).map(character =>
                typeof character === "string" ? { name: character, photo: "" } : character
            );
        }
    }catch(error){
        console.error("Не удалось загрузить данные", error);
        chats = {};
        characters = [];
    }
}

window.onload = function(){
    loadData();
    renderChats();
    renderCharacters();

    const firstChat = Object.keys(chats)[0];
    if(firstChat) openChat(firstChat);
};

function newChat(){
    const name = document.getElementById("chatName").value.trim();
    if(!name) return;

    if(!chats[name]) chats[name] = [];

    saveData();
    renderChats();
    openChat(name);
    document.getElementById("chatName").value = "";
}

function renderChats(){
    const box = document.getElementById("chatList");
    box.innerHTML = "";

    Object.keys(chats).forEach(name=>{
        const div = document.createElement("div");
        div.className = "chat-item";

        const button = document.createElement("button");
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

    chats[name].forEach((msg, index)=> showMessage(msg, index));
}

function deleteCurrentChat(){
    if(!currentChat) return;

    delete chats[currentChat];
    currentChat = null;

    saveData();
    messagesBox.innerHTML = "";
    document.getElementById("chatTitle").innerText = "Новый чат";
    renderChats();
}

// ---------- ПЕРСОНАЖИ ----------

function addCharacter(){
    const input = document.getElementById("characterName");
    const name = input.value.trim();
    if(!name || characters.some(character => character.name === name)) return;

    characters.push({ name, photo: "" });
    saveData();
    renderCharacters();
    input.value = "";
}

function renderCharacters(){
    const select = document.getElementById("characterSelect");
    select.innerHTML = "<option value=\"\">Выбери персонажа</option>";

    characters.forEach(character=>{
        const option = document.createElement("option");
        option.value = character.name;
        option.innerText = character.name;
        select.appendChild(option);
    });

    updateCharacterAvatarEditor();
}

function getCharacter(name){
    return characters.find(character => character.name === name);
}

function updateCharacterAvatarEditor(){
    const select = document.getElementById("characterSelect");
    const character = getCharacter(select.value);
    const preview = document.getElementById("characterAvatarPreview");
    const removeButton = document.getElementById("removeCharacterPhoto");

    if(!character){
        preview.innerHTML = "?";
        preview.classList.remove("has-photo");
        preview.style.backgroundImage = "";
        removeButton.classList.remove("visible");
        return;
    }

    if(character.photo){
        preview.innerHTML = "";
        preview.style.backgroundImage = `url("${character.photo}")`;
        preview.classList.add("has-photo");
        removeButton.classList.add("visible");
    }else{
        preview.innerText = character.name[0].toUpperCase();
        preview.style.backgroundImage = "";
        preview.classList.remove("has-photo");
        removeButton.classList.remove("visible");
    }
}

function handleCharacterPhoto(event){
    const file = event.target.files[0];
    const name = document.getElementById("characterSelect").value;
    const character = getCharacter(name);

    if(!file || !character || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = function(){
        character.photo = reader.result;
        saveData();
        updateCharacterAvatarEditor();
        if(currentChat) openChat(currentChat);
    };
    reader.readAsDataURL(file);
}

function removeCharacterPhoto(){
    const name = document.getElementById("characterSelect").value;
    const character = getCharacter(name);
    if(!character) return;

    character.photo = "";
    document.getElementById("characterPhotoInput").value = "";
    saveData();
    updateCharacterAvatarEditor();
    if(currentChat) openChat(currentChat);
}

document.getElementById("characterSelect").addEventListener("change", updateCharacterAvatarEditor);

// ---------- ФОТО СООБЩЕНИЯ ----------

function attachPhoto(){
    document.getElementById("photoInput").click();
}

function handlePhoto(event){
    const file = event.target.files[0];
    if(!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = function(){
        const preview = document.getElementById("photoPreview");
        preview.src = reader.result;
        preview.classList.add("visible");
        document.getElementById("removePhoto").classList.add("visible");
    };
    reader.readAsDataURL(file);
}

function removePhoto(){
    const input = document.getElementById("photoInput");
    const preview = document.getElementById("photoPreview");

    input.value = "";
    preview.src = "";
    preview.classList.remove("visible");
    document.getElementById("removePhoto").classList.remove("visible");
}

// ---------- СООБЩЕНИЯ ----------

function sendMessage(){
    if(!currentChat) return;

    const type = document.getElementById("type").value;
    const text = document.getElementById("messageText").value.trim();
    const author = type === "me" ? "me" : document.getElementById("characterSelect").value;
    const photo = document.getElementById("photoPreview").src || "";

    if(!text && !photo) return;
    if(type === "other" && !author) return;

    chats[currentChat].push({ author, text, type, photo });

    saveData();
    openChat(currentChat);
    document.getElementById("messageText").value = "";
    removePhoto();
}

function showMessage(msg, index){
    const div = document.createElement("div");

    if(msg.type === "me"){
        div.className = "message me";
        div.innerHTML = `
            <div class="bubble my-bubble">
                ${escapeHTML(msg.text)}
                ${msg.photo ? `<img class="message-photo" src="${msg.photo}" alt="Фото">` : ""}
            </div>
        `;
    }else{
        div.className = "message";

        const previous = index > 0 ? chats[currentChat][index - 1] : null;
        const showAuthor = !previous || previous.type === "me" || previous.author !== msg.author;
        const character = getCharacter(msg.author);
        const avatar = character && character.photo
            ? `<div class="avatar avatar-photo" style="background-image:url('${character.photo}')"></div>`
            : `<div class="avatar">${escapeHTML((msg.author || "?")[0])}</div>`;

        div.innerHTML = `
            ${showAuthor ? avatar : `<div class="avatar avatar-empty"></div>`}
            <div class="message-content ${showAuthor ? "" : "message-continuation"}">
                ${showAuthor ? `<div class="name">${escapeHTML(msg.author)}</div>` : ""}
                <div class="bubble other-bubble">
                    ${escapeHTML(msg.text)}
                    ${msg.photo ? `<img class="message-photo" src="${msg.photo}" alt="Фото">` : ""}
                </div>
            </div>
        `;
    }

    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function escapeHTML(value){
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>");
}

document.getElementById("messageText").addEventListener("keydown", function(event){
    if((event.ctrlKey || event.metaKey) && event.key === "Enter"){
        event.preventDefault();
        sendMessage();
    }
});

document.getElementById("type").addEventListener("change", function(){
    document.getElementById("characterSelect").disabled = this.value === "me";
});
