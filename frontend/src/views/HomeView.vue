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
    await sleep(1000);
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
  .join('\n\n'); // Join the formatted strings with a newline character
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

</script>

<template>
  <header>
    <h1>{{ CurrentItem.name }}</h1>
    <div v-show="!CurrentItem.pointsHidden">
      <h1>{{ CurrentPoints }}</h1>
      <h1 v-if="isHost">{{ Voters }}</h1>
    </div>
    
    <div v-if="!isHost">
      <button @click="SetPoints(0)">0</button>
      <button @click="SetPoints(1)">1</button>
      <button @click="SetPoints(2)">2</button>
      <button @click="SetPoints(3)">3</button>
      <button @click="SetPoints(4)">4</button>
      <button @click="SetPoints(5)">5</button>
    </div>
    <div v-if="isAdmin">
      <button @click="SendAdminCommand('exit')">Stäng av</button>
      <button @click="SendAdminCommand('next')">Nästa öl</button>
      <button @click="SendAdminCommand('prev')">Förra öl</button>
      <button @click="SendAdminCommand('show-points')">Visa poäng</button>
      <button @click="SendAdminCommand('hide-points')">Dölj poäng</button>
      <button @click="SendAdminCommand('save-list')">Spara lista</button>
    </div>
  </header>
</template>

<style scoped>
</style>

