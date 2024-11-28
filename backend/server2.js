const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Variable to hold the "current" data
let list = null;
let curIndex = 0;

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
  list = data;
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
  res.json({ current: list[curIndex], curIndex: curIndex });
});

// Endpoint to set the "current" data to a specific line based on an index
app.get('/next', (req, res) => {
    if(curIndex + 1 < list.length) {
        curIndex++;
        console.log("New index: " + curIndex);
        res.sendStatus(200);
    }
    res.sendStatus(400);
});

app.get('/prev', (req, res) => {
    if(curIndex >= 1 ){
        curIndex--;
        console.log("New index: " + curIndex);
        res.sendStatus(200);
    }
    res.sendStatus(400);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });