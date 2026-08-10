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
                typeof character