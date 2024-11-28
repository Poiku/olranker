<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'

// Define the URL and options for the fetch request
let serverURL = "http://127.0.0.1:3000/"; // Replace with your API endpoint
const options = {
  method: 'GET', // or 'POST', 'PUT', etc.
  headers: {
    'Content-Type': 'application/json', // Adjust headers if needed
    //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
  },
  // body: JSON.stringify({ key: 'value' }) // Include this if you're sending data with POST/PUT requests
};

let nextCurrentName = ref("");
async function SetCurrent(){
  const url = serverURL + "set-current";
  let nextName = nextCurrentName.value;
  let options = {
  method: 'POST', // or 'POST', 'PUT', etc.
  headers: {
    'Content-Type': 'application/json', // Adjust headers if needed
    //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
  },
   body: JSON.stringify({ name: nextName }) // Include this if you're sending data with POST/PUT requests
};

  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON if that's the expected format
    return data.value; // Return the data to the caller
  } catch (error) {
    console.error('Error:', error); // Handle the error
    throw error; // Optionally, rethrow the error so the caller can handle it
  }
}

let CurrentName = ref("ja");

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
    return data.value; // Return the data to the caller
  } catch (error) {
    console.error('Error:', error); // Handle the error
    throw error; // Optionally, rethrow the error so the caller can handle it
  }
}

Loop();
async function Loop(){
  while(true){
    let result = await GetCurrent();
    console.log(result);
    CurrentName.value = result;
    //console.log("fetch current");
    await sleep(1000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    <h1>{{ CurrentName }}</h1>
    <input type="text" v-model="nextCurrentName">
    <button v-on:click="SetCurrent">Set</button>
    <button v-on:click="GetCurrent">fetch</button>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

