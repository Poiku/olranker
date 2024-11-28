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
  for(let i = 0; i < data.length; i++){
    list[i] = {
      name: data[i],
      points: [],
      pointsHidden: true,
      exit: false
    }
  }
  console.log('Text file loaded successfully!');
}).catch(err => {
  console.error('Error loading text file:', err);
});

// Middleware to parse JSON bodies (for future POST requests)
app.use(express.json());

// Endpoint to get the current data (entire file content as an array of lines)
app.get('/get-current', (req, res) => {
  if (list === null) {
    return res.status(500).json({ error: 'Text file data is not loaded yet' });
  }
  res.json(list[curIndex]);
});

app.get('/exit', (req, res) => {
  list[curIndex].exit = true;
  console.log("Shutting down in 2s...");
  res.sendStatus(200);
  setTimeout(() => {
    process.exit();
  }, 2000); // Delay for 5 seconds (5000 milliseconds)
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
  console.log(points);
  if(showingPoints){
    return res.status(400);
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
  currentPoints.forEach(element => {
    console.log(element.player.id);
  });

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
  showingPoints = true;
  SetPointVisibility(true);
  res.sendStatus(200);
});

app.get('/hide-points', (req, res) => {
  showingPoints = false;
  SetPointVisibility(false);
  res.sendStatus(200);
});

app.get('/status', (req, res) => {
  res.sendStatus(200);
});

function SetPointVisibility(show){
  if(show) {
    list[curIndex].pointsHidden = false;
    console.log("Visar poäng.");
  }
  else {
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });