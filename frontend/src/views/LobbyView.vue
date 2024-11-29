<script setup>
import { ref } from 'vue'
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies
import { useRouter } from 'vue-router'
import { base64ToDecimal } from '@/assets/base-convert';

const router = useRouter();

let playerName = ref("");
let serverURL = ref("");
let ip = ref("");

async function AddPlayer(){
  ip.value = int2ip(base64ToDecimal(serverURL.value));
  const baseURL = "http://" + (serverURL.value == "localhost" ? "localhost" : ip.value) + ":3000/";
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
    router.push('/');
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
</script>

<template>
  <main>
    <input type="text" v-model="serverURL">
    <input type="text" v-model="playerName">
    <button @click="AddPlayer">Gå med</button>
    <div>{{ ip }}</div>
  </main>
</template>
