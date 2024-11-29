<script setup>
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies
import { useRouter } from 'vue-router'
import Controls from '@/components/Controls.vue';

const router = useRouter();
const serverURL = Cookies.get('serverURL');

let results = null;
let mappedResults = ref(null);

async function GenerateList(){
    mappedResults.value = results
  .map(entry => {
    // Sum the points, ensuring that if a point is NaN or undefined, it defaults to 0
    const totalPoints = entry.points.reduce((sum, p) => {
      const validPoints = isNaN(p.points) || p.points === undefined ? 0 : p.points;
      return sum + validPoints;
    }, 0); 

    // Calculate average points (handle the case where there might be no points to avoid division by 0)
    const averagePoints = entry.points.length > 0 ? totalPoints / entry.points.length : 0;

    // Apply the rounding to one decimal place
    const roundedAveragePoints = Math.round(averagePoints * 10) / 10;

    return {
      name: entry.name,
      points: roundedAveragePoints
    };
  })
  .sort((a, b) => b.points - a.points); // Sort by points in descending order

}

async function GetList() {
  if(serverURL != null){
    const url = serverURL + "get-list";
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
      if(data.showResult == false) router.push('/')
      else return data; // Return the data to the caller
    } catch (error) {
      console.error('Error:', error); // Handle the error
      throw error; // Optionally, rethrow the error so the caller can handle it
    }
  }
}

async function Loop(){
    while(true){
    results = await GetList();
    if (results != null) GenerateList();
    await sleep(3000);
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

onMounted(() => {
  Loop();
});
</script>


<template>

    <div>
        <ol  class="container">
            <li v-for="(item, index) in mappedResults" :key="index">{{ item.name }} - {{ item.points }}/5</li>
        </ol>
    </div>

    <Controls />
  </template>
  

  <style scoped>
  .container{
    display:flex;
flex-direction:column;
max-height:100vh;
flex-wrap:wrap;
margin: 0;
  }
li{
    font-family: interblack;
    font-size: 30px;
    margin: 25px;
}

@media only screen and (max-width: 600px) { 
    .container{
        flex-wrap: nowrap;
        max-height: fit-content;
    }
    ol{
        margin-bottom: 80px;
    }

}
  </style>
  