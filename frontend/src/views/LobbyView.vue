<script setup>
import { ref } from 'vue'
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies
import { useRouter } from 'vue-router'
import { base64ToDecimal } from '@/assets/base-convert';
import WideButton from '@/components/WideButton.vue';
import Controls from '../components/Controls.vue'

const router = useRouter();

let playerName = ref("");
let serverURL = ref("");
let ip = ref("");
let baseURL = null;

// Waiting in lobby
let waiting = ref(false);

async function AddPlayer(){
  ip.value = int2ip(base64ToDecimal(serverURL.value));
  baseURL = "http://" + (serverURL.value == "localhost" ? "localhost" : ip.value) + ":3000/";
  const url = baseURL + "add-player";
  let options = {
  method: 'POST', // or 'POST', 'PUT', etc.
  headers: {
    'Content-Type': 'application/json', // Adjust headers if needed
    //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
  },
   body: JSON.stringify({ name: playerName.value }) // Include this if you're sending data with POST/PUT requests
};

  
  try {
    const response = await fetch(url, options);
    if (!response.ok) { // visa felmeddelande, annars gå vidare ur lobbyn
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON if that's the expected format
    Cookies.set('playerID', data.player.id, { expires: 1 });
    Cookies.set('serverURL', baseURL, {expires: 1});
    if(playerName.value == "William") Cookies.set('admin', true, { expires: 1 });
    else if(playerName.value == "host") Cookies.set('host', true, { expires: 1 });
    waiting.value = true;
    //router.push('/');
    return data.value; // Return the data to the caller
  } catch (error) {
    console.error('Error:', error); // Handle the error
    ip.value = error;
    throw error; // Optionally, rethrow the error so the caller can handle it
  }
}

function int2ip (ipInt) {
    return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
}

let PlayerList = ref("");
Loop();
async function Loop(){
  while(true){
    if(waiting){
      const playerList = await GetPlayerList();
      if(playerList != null) PlayerList.value = await ProcessPlayerList(playerList);
    }
    await sleep(500);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function GetPlayerList() {
  if(baseURL != null){
    const url = baseURL + "get-player-list";
    const options = {
      method: 'GET', // Adjust as needed
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON if that's the expected format
      return data; // Return the data to the caller
    } catch (error) {
      console.error('Error:', error); // Handle the error
      throw error; // Optionally, rethrow the error so the caller can handle it
    }
  }
}

async function ProcessPlayerList(list){
  console.log(list);
  return list.map(entry => entry.name);
}
</script>

<template>
  <main>
    <div class="login" v-show="!waiting">
      <h1>Ölranker</h1>
      <input placeholder="Kod" type="text" v-model="serverURL">
      <input placeholder="Namn" type="text" v-model="playerName">
      <WideButton @click="AddPlayer" :text="'Gå med'" :width="300" height="50"></WideButton>
      <div>{{ ip }}</div>
    </div>
    <div v-if="waiting" class="waitroom">
    <div class="player-list">
      <div class="player-name title">Anslutna:</div>
      <div v-for="(player, index) in PlayerList" :key="index" class="player-name">
        {{ player }}
      </div>
    </div>
    </div>

    <Controls />
  </main>
</template>

<style scoped>
BigButton{
  margin-top: 200px;
}

::placeholder, input[type=text] {
   text-align: center; 
   font-size: 20px;
   font-family: interblack;
}

.login{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

input[type=text]{
  width: 300px;
  height: 80px;
  margin-bottom: 50px;
}

h1{
  font-family: interblack;
  font-size: 100px;
  margin: 0;
  margin-bottom: 90px;
}

.player-list{
  margin-top: 50px;
  text-align: center;
}

.player-name{
  font-family: interblack;
  font-size: 40px;
}

.player-name.title{
  font-size: 50px;
}

.player-name.title{
  text-decoration: underline;
  margin-bottom: 50px;
}

@media only screen and (max-width: 600px) {
h1{
  font-size: 65px;
}

.login{
  margin-top: 50px;
  height: inherit;
}

.player-list{
  margin-top: 40px;
}

.player-name{
  font-size: 30px;
  margin: 10px;
}

.player-name.title{
  font-size: 50px;
}
}
</style>