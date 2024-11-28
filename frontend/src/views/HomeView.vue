<script setup>
import { ref } from 'vue'
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies
import { useRouter } from 'vue-router'
  
  const router = useRouter();
  const playerID = Cookies.get('playerID');
  const serverURL = Cookies.get('serverURL');
  const isAdmin = Cookies.get('admin');
  const isHost = Cookies.get('host');

// Define the URL and options for the fetch request
const options = {
  method: 'GET', // or 'POST', 'PUT', etc.
  headers: {
    'Content-Type': 'application/json', // Adjust headers if needed
    //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
  },
  // body: JSON.stringify({ key: 'value' }) // Include this if you're sending data with POST/PUT requests
};


const activeVote = ref(0);
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
    console.log(data);
    //activeVote.value = data.points;
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
    throw error; // Optionally, rethrow the error so the caller can handle it
  }
}

let CurrentItem = ref({
  name: null,
  points: null,
  pointsHidden: true,
  exit: false
});
Loop();
async function Loop(){
  while(true){
    CurrentItem.value = await GetCurrent();
    const matchingItem = CurrentItem.value.points.find(item => item.player.id == playerID);
    const points = matchingItem ? matchingItem.points : 0;
    activeVote.value = points;
    console.log(matchingItem);
    ProcessPoints();
    if(CurrentItem.value.exit){
      // Clear all cookies
      const allCookies = Cookies.get();
      for (let cookie in allCookies) {
        Cookies.remove(cookie);
      }

      router.push('/lobby');
    }

    //console.log(CurrentItem);
    await sleep(100);
  }
}

let CurrentPoints = ref("");
let Voters = ref("");
async function ProcessPoints(){
  const totalPoints = CurrentItem.value.points.reduce((sum, item) => sum + item.points, 0);
  const averagePoints = totalPoints / CurrentItem.value.points.length;
  CurrentPoints.value = averagePoints;
  Voters.value = CurrentItem.value.points
  .map(item => `${item.player.name} gav ${item.points} poäng`) // Format each item
  .join('\n'); // Join the formatted strings with a newline character
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

</script>

<template>
  <div class="view">
    <div class="info">
      <h1>{{ CurrentItem.name }}</h1>
      <div v-show="!CurrentItem.pointsHidden" class="points">
        <h2>{{ CurrentPoints }}</h2>
        <h2 v-if="isHost" style="white-space: pre-line; text-align: center;">{{ Voters }}</h2>
      </div>
    </div>
    <div v-if="!isHost">
      <button
      v-for="num in 6"
      :key="num"
      @click="SetPoints(num - 1)"
      :style="{ backgroundColor: activeVote === num - 1 ? 'lightblue' : '' }"
    >
      {{ num - 1 }}
    </button>
    </div>
    <div v-if="isAdmin">
      <button @click="SendAdminCommand('exit')">Stäng av</button>
      <button @click="SendAdminCommand('next')">Nästa öl</button>
      <button @click="SendAdminCommand('prev')">Förra öl</button>
      <button @click="SendAdminCommand('show-points')">Visa poäng</button>
      <button @click="SendAdminCommand('hide-points')">Dölj poäng</button>
      <button @click="SendAdminCommand('save-list')">Spara lista</button>
    </div>
  </div>
</template>

<style scoped>
.view{
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info, .points{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1{
  font-size: 100px;
}


</style>

