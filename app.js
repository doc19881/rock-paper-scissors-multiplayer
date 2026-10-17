import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getDatabase, ref, runTransaction, set, onValue, get } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const setup = document.querySelector("#setup");
const game = document.querySelector("#game");
const codeInput = document.querySelector("#room-code");
const setupMessage = document.querySelector("#setup-message");
const statusText = document.querySelector("#game-status");
const choices = [...document.querySelectorAll(".choice")];
const icons = { rock: "✊", paper: "✋", scissors: "✌️" };
let db, user, roomCode, room, isHost = false, stopRoom = null;

function fail(error) { console.error(error); setupMessage.textContent = `Couldn't connect: ${error.message || error}. Check Firebase setup.`; statusText.textContent = `Connection error: ${error.message || error}`; }
async function start() {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("PASTE_")) { setupMessage.textContent = "First set up Firebase, then fill in firebase-config.js."; document.querySelectorAll("#setup button").forEach(button => button.disabled = true); return; }
  initializeApp(firebaseConfig); db = getDatabase();
  try { user = (await signInAnonymously(getAuth())).user; setupMessage.textContent = "Ready. Create a room or enter a friend's code."; const code = location.hash.slice(1).toUpperCase(); if (/^[A-Z0-9]{6}$/.test(code)) codeInput.value = code; } catch (error) { fail(error); }
}
function makeCode() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return [...crypto.getRandomValues(new Uint8Array(6))].map(byte => chars[byte % chars.length]).join(""); }
async function createRoom() { if (!user) return; setupMessage.textContent = "Creating your room…"; try { for (let i=0;i<5;i++) { const code=makeCode(); const result=await runTransaction(ref(db,`rooms/${code}`),current=>current===null?{host:user.uid,guest:"",round:1,moves:{}}:undefined); if(result.committed){enterRoom(code,true);return;} } throw new Error("Could not find an unused room code. Try again."); } catch(error){fail(error);} }
async function joinRoom() { if(!user)return; const code=codeInput.value.trim().toUpperCase(); if(!/^[A-Z0-9]{6}$/.test(code)){setupMessage.textContent="Enter the six-character room code.";return;} setupMessage.textContent="Joining room…"; try { const roomRef=ref(db,`rooms/${code}`); const found=(await get(roomRef)).val(); if(!found)throw new Error("Room not found. Check the code."); if(found.host===user.uid||found.guest===user.uid){enterRoom(code,found.host===user.uid);return;} if(found.guest)throw new Error("That room already has two players."); const result=await runTransaction(ref(db,`rooms/${code}/guest`),current=>current===""?user.uid:undefined); if(!result.committed)throw new Error("Someone else just joined. Try another code."); enterRoom(code,false); }catch(error){fail(error);} }
function enterRoom(code,host) { roomCode=code; isHost=host; setup.classList.add("hidden");game.classList.remove("hidden");document.querySelector("#room-label").textContent=code;history.replaceState(null,"",`#${code}`);stopRoom?.();stopRoom=onValue(ref(db,`rooms/${code}`),snapshot=>{room=snapshot.val();if(!room){statusText.textContent="This room was closed.";return;}renderRoom();},fail); }
function winner(a,b) { if(a===b)return "Tie game!"; return ({rock:"scissors",paper:"rock",scissors:"paper"})[a]===b?"You win this round!":"Your friend wins this round!"; }
function renderRoom() { const round=room.round||1, other=isHost?room.guest:room.host, mine=room.moves?.[round]?.[user.uid]||"", theirs=other?(room.moves?.[round]?.[other]||""): ""; let myScore=0,theirScore=0; Object.values(room.moves||{}).forEach(m=>{const a=m?.[user.uid],b=other?m?.[other]:"";if(a&&b&&a!==b){if(winner(a,b)==="You win this round!")myScore++;else theirScore++;}}); document.querySelector("#round-label").textContent=round;document.querySelector("#my-score").textContent=myScore;document.querySelector("#their-score").textContent=theirScore;document.querySelector("#my-hand").textContent=mine?icons[mine]:"?";document.querySelector("#their-hand").textContent=mine&&theirs?icons[theirs]:"?";document.querySelector("#round-result").textContent=mine&&theirs?winner(mine,theirs):"";choices.forEach(b=>b.disabled=!other||Boolean(mine));document.querySelector("#next-round").classList.toggle("hidden",!(isHost&&mine&&theirs));statusText.textContent=!other?"Waiting for your friend to join…":mine&&theirs?"Both moves are in. Nice round!":mine?"Move locked in — waiting for your friend…":theirs?"Your friend has picked. Your turn!":"Pick your move!"; }
async function play(choice) { if(!room||!room.guest||room.moves?.[room.round]?.[user.uid])return; try{await set(ref(db,`rooms/${roomCode}/moves/${room.round}/${user.uid}`),choice);}catch(error){fail(error);} }
document.querySelector("#create-button").addEventListener("click",createRoom);document.querySelector("#join-button").addEventListener("click",joinRoom);codeInput.addEventListener("keydown",e=>{if(e.key==="Enter")joinRoom();});codeInput.addEventListener("input",()=>{codeInput.value=codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);});choices.forEach(b=>b.addEventListener("click",()=>play(b.dataset.choice)));
document.querySelector("#next-round").addEventListener("click",async()=>{if(isHost&&room?.moves?.[room.round]?.[user.uid]&&Object.keys(room.moves[room.round]).length>=2){try{await set(ref(db,`rooms/${roomCode}/round`),room.round+1);}catch(error){fail(error);}}});
document.querySelector("#copy-link").addEventListener("click",async e=>{try{await navigator.clipboard.writeText(`${location.href.split("#")[0]}#${roomCode}`);e.target.textContent="Copied!";}catch{e.target.textContent=`Room code: ${roomCode}`;}setTimeout(()=>e.target.textContent="Copy invite link",1800);});
document.querySelector("#leave-room").addEventListener("click",()=>{stopRoom?.();stopRoom=null;room=null;roomCode=null;history.replaceState(null,"",location.pathname+location.search);game.classList.add("hidden");setup.classList.remove("hidden");setupMessage.textContent="Ready. Create a room or enter a friend's code.";});
start();
