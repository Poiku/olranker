<template>
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
</template>

<script setup>
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies
  const isAdmin = Cookies.get('admin');
  const serverURL = Cookies.get('serverURL');
  const options = {
    method: 'GET', // or 'POST', 'PUT', etc.
    headers: {
        'Content-Type': 'application/json', // Adjust headers if needed
        //'Authorization': 'Bearer your-token-here', // Optional, if authentication is required
    },
    // body: JSON.stringify({ key: 'value' }) // Include this if you're sending data with POST/PUT requests
};

  async function SendAdminCommand(command){
  fetch(serverURL + command, options);
  }
</script>