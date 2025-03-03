const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
const port = 3000;

// Variable to hold the "current" data
let list = [];
let curIndex = 0;

// Player info
let PlayerList = [];

// Host info
let hostID = "";

//
let showingPoints = false;

//
let exit = false;

//
let showResult = false;

// Function to read a text file and split it by newlines
function readTextFile() {
  const filePath = path.join(__dirname, 'data.txt'); // Path to the text file

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err); // Reject the promise if there is an error reading the file
      } else {
        // Split the file content into lines and return it as an array
        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        resolve(lines);
      }
    });
  });
}

// Initial load of text file into the "current" variable
readTextFile().then(data => {
  list[0] = {
    id: 0,
    name: "Ansluten",
    points: [],
    pointsHidden: true
  }
  for(let i = 1; i < data.length + 1; i++){
    list[i] = {
      id: i,
      name: data[i - 1],
      points: [],
      pointsHidden: true
    }
  }
  console.log('Text file loaded successfully!');
  console.log(list);
}).catch(err => {
  console.error('Error loading text file:', err);
});

// Middleware to parse JSON bodies (for future POST requests)
app.use(express.json());

// Endpoint to get the current data (entire file content as an array of lines)
app.get('/get-current', (req, res) => {
  if(exit){
    res.json({exit});
  }
  else if(showResult){
    res.json({showResult});
  }
  else if (list === null) {
    return res.status(500).json({ error: 'Text file data is not loaded yet' });
  }
  else{
    res.json(list[curIndex]);
  }
});

app.get('/get-list', (req, res) => {
  if (list === null) {
    return res.status(500).json({ error: 'Text file data is not loaded yet' });
  }
  else if(!showResult){
    res.json({showResult});
  }
  else{
    res.json(list.slice(1));  // slice(1) removes the first element (index 0)  
  }
});

app.get('/exit', (req, res) => {
  console.log("Shutting down...");
  exit = true; // assuming this flag is used elsewhere to manage app state
  res.sendStatus(200);
  
  // Set a timeout to shut down the process after 5 seconds
  setTimeout(() => {
    process.exit();
  }, 5000);
});


// Endpoint to set the "current" data to a specific line based on an index
app.get('/next', (req, res) => {
    if(curIndex + 1 < list.length) {
        curIndex++;
        console.log("New index: " + curIndex);
        SetPointVisibility(false);
        res.sendStatus(200);
    }
    else{
      res.sendStatus(400);
    }
});

app.get('/prev', (req, res) => {
    if(curIndex >= 1 ){
        curIndex--;
        console.log("New index: " + curIndex);
        SetPointVisibility(false);
        res.sendStatus(200);
    }
    else{
      res.sendStatus(400);
    }
});

app.get('/toggle-show-result', (req, res) => {
  showResult = !showResult;
  console.log("Visar resultat: " + showResult);
  res.sendStatus(200);
});

// Utility function to generate a unique random ID
function generateUniqueRandomId() {
  let id;
  do {
      id = Math.floor(1000 + Math.random() * 900000);
  } while (PlayerList.some(player => player.id === id) && id == 0);
  return id;
}

// POST route to add a player
app.post('/add-player', (req, res) => {
  const { name } = req.body;
  console.log(name);
  if (!name || typeof name !== 'string') {
      console.log("Fel när " + req.body.name + " skulle gå med.");
      return res.status(400).json({ error: 'Invalid name provided.' });
  }

  const playerId = generateUniqueRandomId();
  const newPlayer = { id: playerId, name };

  PlayerList.push(newPlayer);
  console.log(req.body.name + " gick med!");
  console.log(PlayerList);
  res.status(201).json({player: newPlayer});
});

// POST route to set points
app.post('/set-points', (req, res) => {
  const { playerID, points } = req.body;
  if(showingPoints){
    return res.json("cant change rn");
  }
  // Validate that `id` and `points` are provided and of correct types
  if (!playerID || !PlayerList.some(listedPlayer => playerID == listedPlayer.id)) {
      console.log("Saknar ID");
      return res.status(400).json({ error: 'Invalid or missing id.' });
  }

  /*if (!points || (points < 0 || points > 5)) {
      console.log("Fel poänginmatning.");
      return res.status(400).json({ error: 'Points must be 1, 2, 3, 4, or 5.' });
  }*/

  // Access the points array in the current list item
  const currentPoints = list[curIndex].points;

  // Check if an object with the given `id` already exists
  const existingIndex = currentPoints.findIndex(entry => entry.player.id == playerID);

  // Get the current player
  const currentPlayer = PlayerList.find(player => player.id == playerID);

  if (existingIndex !== -1) {
      // If the `id` already exists, update its points value
      currentPoints[existingIndex].points = points;
  } else {
      // Otherwise, add a new object with `id` and `points`
      currentPoints.push({ player: currentPlayer, points });
  }

  console.log(list[curIndex].points);

  res.status(200).json({ message: 'Points updated successfully!', points });
});

app.get('/show-points', (req, res) => {
  SetPointVisibility(true);
  res.sendStatus(200);
});

app.get('/hide-points', (req, res) => {
  SetPointVisibility(false);
  res.sendStatus(200);
});

app.get('/status', (req, res) => {
  res.sendStatus(200);
});

function SetPointVisibility(show){
  if(show) {
    showingPoints = true;
    list[curIndex].pointsHidden = false;
    console.log("Visar poäng.");
  }
  else {
    showingPoints = false;
    list[curIndex].pointsHidden = true;
    console.log("Döljer poäng.");
  }
}

// GET endpoint to save the list to a file
app.get('/save-list', (req, res) => {
  // Save the `list` variable to a text file
  fs.writeFile('result.txt', JSON.stringify(list, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).send('Failed to save the list.');
    }
    res.send('List saved to result.txt');
  });
});

var ip = require("ip");
console.dir(ip.address());

app.get('/get-ip', (req, res) => {
  res.json({ip: ip.toLong(ip.address())})
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });