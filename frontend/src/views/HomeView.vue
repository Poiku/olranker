<script setup>
import { ref } from 'vue'
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies
import { useRouter } from 'vue-router'
import BigButton from '../components/BigButton.vue'
import { decimalToBase64 } from '@/assets/base-convert';
  
  const router = useRouter();
  const playerID = Cookies.get('playerID');
  const serverURL = Cookies.get('serverURL');
  const isAdmin = Cookies.get('admin');
  const isHost = Cookies.get('host');
  const activeVote = ref(-1);

// Define the URL and options for the fetch request
const options = {
  method: 'GET', // or 'POST', 'PUT', etc.
  headers: {
    'Content-Type': 'application/json', // Adjust headers if needed
    //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
  },
  // body: JSON.stringify({ key: 'value' }) // Include this if you're sending data with POST/PUT requests
};


async function SetPoints(points){
  const url = serverURL + "set-points";
  let options = {
  method: 'POST', // or 'POST', 'PUT', etc.
  headers: {
    'Content-Type': 'application/json', // Adjust headers if needed
    //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
  },
   body: JSON.stringify({ playerID, points }) // Include this if you're sending data with POST/PUT requests
};

  
  try {
    const response = await fetch(url, options);
    if (!response.ok) { // visa felmeddelande, annars gå vidare ur lobbyn
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON if that's the expected format
    return data.value; // Return the data to the caller
  } catch (error) {
    console.error('Error:', error); // Handle the error
    throw error; // Optionally, rethrow the error so the caller can handle it
  }
}

async function SendAdminCommand(command){
  fetch(serverURL + command, options);
}

async function GetCurrent() {
  if(serverURL == null) return
  const url = serverURL + "get-current";
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
    ExitSession();
    throw error; // Optionally, rethrow the error so the caller can handle it
  }
}

let CurrentItem = ref({
  name: null,
  points: null,
  pointsHidden: true
});
Loop();
async function Loop(){
  while(true){
    CurrentItem.value = await GetCurrent();
    const matchingItem = CurrentItem.value.points.find(item => item.player.id == playerID);
    const points = matchingItem ? matchingItem.points : -1;
    activeVote.value = points;
    ProcessPoints();

    //console.log(CurrentItem);
    await sleep(100);
  }
}

function ExitSession(){
  // Clear all cookies
  const allCookies = Cookies.get();
  for (let cookie in allCookies) {
    Cookies.remove(cookie);
  }

  router.push('/lobby');
}

let CurrentPoints = ref("");
let Voters = ref("");
async function ProcessPoints(){
  const totalPoints = CurrentItem.value.points.reduce((sum, item) => sum + item.points, 0);
  const averagePoints = totalPoints / CurrentItem.value.points.length;
  CurrentPoints.value = Math.round(averagePoints * 10)/10;
  Voters.value = CurrentItem.value.points
  .map(item => `${item.player.name} gav ${item.points} poäng`) // Format each item
  .join('\n'); // Join the formatted strings with a newline character
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let ServerCode = ref("ingen ip");
async function Host(){
  if(isHost){
  let ip = await GetServer();
  console.log(ip.ip);
  let code = decimalToBase64(ip.ip);
  ServerCode.value = code;
  console.log(code);
}
}
Host();
async function GetServer(){
  const url = "http://localhost:3000/get-ip";
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

</script>

<template>
  <div class="view">
    <div class="info">
      <h1 id="name">{{ CurrentItem.name }}</h1>
      <h1 v-if="isHost" v-show="CurrentItem.id == 0">Kod: {{ServerCode}}</h1>

      <div v-show="!CurrentItem.pointsHidden" class="points">
        <h2 id="points">Poäng: {{ CurrentPoints }} / 5</h2>
        <h3 v-if="isHost" style="white-space: pre-line; text-align: center;">{{ Voters }}</h3>
      </div>

    </div>
    <div v-if="!isHost" v-show="CurrentItem.id != 0" class="vote-buttons" :style="{ 'margin-top': CurrentItem.pointsHidden ? '34px' : '-10px' }">
      <BigButton class="votebutton"
      v-for="num in 6"
      :key="num"
      @click="SetPoints(num - 1)"
      :selected="activeVote == num - 1"
      :text="num - 1"
    >
      {{ num - 1 }}
      </BigButton>
    </div>
    <div v-show="isAdmin">
      <button @click="SendAdminCommand('exit')">Stäng av</button>
      <button @click="SendAdminCommand('next')">Nästa öl</button>
      <button @click="SendAdminCommand('prev')">Förra öl</button>
      <button @click="SendAdminCommand('show-points')">Visa poäng</button>
      <button @click="SendAdminCommand('hide-points')">Dölj poäng</button>
      <button @click="SendAdminCommand('save-list')">Spara lista</button>
      <br>
      <br>
    </div>
  </div>
</template>

<style scoped>
.view{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
}

.info, .points{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1{
  margin-top: 0;
  font-size: 100px;
  font-family: interblack;
}


h2{
  font-size: 70px;
  font-family: interblack;
}
h3{
  margin-top: 0;
  font-size: 30px;
}
.votebutton{
  margin: 20px;
}

#name{
  margin-bottom: 0;
}

#points{
  margin-top: 0;
}

.vote-buttons{
  display: flex;
  flex-direction: column-reverse;
  margin-top: 20px;
  margin-bottom: 40px;
}

@media only screen and (max-width: 600px) {
  .view{
    justify-content: start;
  }

  .info{
    margin-top: 30px;
  }
  
  #name{
    margin-bottom: 20px;
  }

  #points{
    margin-bottom: 20px;
  }

  h1{
    font-size: 50px;
    text-align: center;
    margin: 0;
  }

  h2{
    font-size: 20px;
  }
}


</style>

