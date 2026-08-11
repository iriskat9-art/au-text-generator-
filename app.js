let chats = {};
let characters = [];
let chatPhotos = {};
let currentChat = null;
const messagesBox = document.getElementById("messages");
const STORAGE_KEY = "auGeneratorData";

function saveData(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify({chats,characters,chatPhotos}));
}

function loadData(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved){
      chats=saved.chats||{};
      characters=(saved.characters||[]).map(c=>typeof c==='string'?{name:c,photo:""}:{name:c.name,photo:c.photo||""});
      chatPhotos=saved.chatPhotos||{};
    }
  }catch(e){
    chats={};
    characters=[];
    chatPhotos={};
  }
}

window.onload=function(){
  loadData();
  renderChats();
  renderCharacters();
  const firstChat=Object.keys(chats)[0];
  if(firstChat)openChat(firstChat);
};

function newChat(){const name=document.getElementById("chatName").value.trim();if(!name)return;if(!chats[name])chats[name]=[];if(chatPhotos[name]===undefined)chatPhotos[name]="";saveData();renderChats();openChat(name);document.getElementById("chatName").value="";}
function renderChats(){const box=document.getElementById("chatList");box.innerHTML="";Object.keys(chats).forEach(name=>{const div=document.createElement("div");div.className="chat-item";const button=document.createElement("button");button.innerText=name;button.onclick=()=>openChat(name);div.appendChild(button);box.appendChild(div);});}
function getFirstChatCharacter(name){const msg=(chats[name]||[]).find(m=>m.type==="other"&&m.author);return msg?getCharacter(msg.author):null;}
function getChatPhoto(name){const character=getFirstChatCharacter(name);return chatPhotos[name]||(character&&character.photo)||"";}
function updateChatHeader(){const title=document.getElementById("chatTitle"),avatar=document.getElementById("chatAvatar"),character=getFirstChatCharacter(currentChat),photo=getChatPhoto(currentChat);title.innerText=currentChat||"Новый чат";avatar.style.backgroundImage=photo?`url("${photo}")`:"";avatar.innerText=photo?"":(character?character.name[0].toUpperCase():"");}
function updateChatAvatarEditor(){const editor=document.getElementById("chatAvatarEditor");if(!editor)return;const preview=document.getElementById("chatAvatarPreview"),removeButton=document.getElementById("removeChatPhoto"),character=getFirstChatCharacter(currentChat);if(!currentChat){editor.style.display="none";return;}editor.style.display="block";const photo=getChatPhoto(currentChat);preview.style.backgroundImage=photo?`url("${photo}")`:"";preview.innerText=photo?"":(character?character.name[0].toUpperCase():"");removeButton.classList.toggle("visible",!!chatPhotos[currentChat]);}
function handleChatPhoto(event){const file=event.target.files[0];if(!file||!currentChat||!file.type.startsWith("image/"))return;const reader=new FileReader();reader.onload=function(){chatPhotos[currentChat]=reader.result;saveData();updateChatHeader();updateChatAvatarEditor();};reader.readAsDataURL(file);}
function removeChatPhoto(){if(!currentChat)return;chatPhotos[currentChat]="";document.getElementById("chatPhotoInput").value="";saveData();updateChatHeader();updateChatAvatarEditor();}
function openChat(name){currentChat=name;messagesBox.innerHTML="";updateChatHeader();updateChatAvatarEditor();(chats[name]||[]).forEach((msg,index)=>showMessage(msg,index));messagesBox.scrollTop=messagesBox.scrollHeight;}
function deleteCurrentChat(){if(!currentChat)return;delete chats[currentChat];delete chatPhotos[currentChat];currentChat=null;saveData();messagesBox.innerHTML="";updateChatHeader();updateChatAvatarEditor();renderChats();}
function deleteLastMessage(){if(!currentChat||!chats[currentChat]||!chats[currentChat].length)return;chats[currentChat].pop();saveData();openChat(currentChat);}

function addCharacter(){
  const input=document.getElementById("characterName");
  const name=input.value.trim();
  if(!name||characters.some(c=>c.name===name))return;
  characters.push({name,photo:""});
  saveData();
  renderCharacters();
  document.getElementById("characterSelect").value=name;
  input.value="";
}

function renderCharacters(){
  const select=document.getElementById("characterSelect");
  select.innerHTML='<option value="">Выбери персонажа</option>';
  characters.forEach(c=>{
    const option=document.createElement("option");
    option.value=c.name;
    option.innerText=c.name;
    select.appendChild(option);
  });
}

function getCharacter(name){return characters.find(c=>c.name===name);}
function attachPhoto(){document.getElementById("photoInput").click();}
function handlePhoto(event){const file=event.target.files[0];if(!file||!file.type.startsWith("image/"))return;const reader=new FileReader();reader.onload=function(){const preview=document.getElementById("photoPreview");preview.src=reader.result;preview.classList.add("visible");document.getElementById("removePhoto").classList.add("visible");};reader.readAsDataURL(file);}
function removePhoto(){const input=document.getElementById("photoInput"),preview=document.getElementById("photoPreview");input.value="";preview.removeAttribute("src");preview.classList.remove("visible");document.getElementById("removePhoto").classList.remove("visible");}
function sendMessage(){if(!currentChat)return;const type=document.getElementById("type").value;const text=document.getElementById("messageText").value.trim();const author=type==="me"?"me":document.getElementById("characterSelect").value;const preview=document.getElementById("photoPreview");const photo=preview.classList.contains("visible")?preview.src:"";if(!text&&!photo)return;if(type==="other"&&!author)return;chats[currentChat].push({author,text,type,photo});saveData();openChat(currentChat);document.getElementById("messageText").value="";removePhoto();}
function makeMessageContent(msg,other){const content=document.createElement("div");content.className="message-content";if(msg.text){const bubble=document.createElement("div");bubble.className=`bubble ${other?"other-bubble":"my-bubble"}`;bubble.textContent=msg.text;content.appendChild(bubble);}if(msg.photo){const image=document.createElement("img");image.className="message-photo standalone-photo";image.src=msg.photo;image.alt="Фото";content.appendChild(image);}return content;}
function showMessage(msg,index){const div=document.createElement("div");if(msg.type==="me"){div.className="message me";div.appendChild(makeMessageContent(msg,false));messagesBox.appendChild(div);return;}const previous=index>0?chats[currentChat][index-1]:null;const sameContact=previous&&previous.type==="other"&&previous.author===msg.author;div.className="message";const content=makeMessageContent(msg,true);if(!sameContact&&msg.author){const name=document.createElement("div");name.className="name";name.textContent=msg.author;content.insertBefore(name,content.firstChild);}div.appendChild(content);messagesBox.appendChild(div);}
document.getElementById("messageText").addEventListener("keydown",function(event){if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();sendMessage();}});
document.getElementById("type").addEventListener("change",function(){document.getElementById("characterSelect").disabled=this.value==="me";});
