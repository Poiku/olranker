const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});

app.get('/', (req, res) => {
  const {param1} = req.query;

  res.send('Hello World!<br>Param1 = ' + param1);
});

app.get('/get-cur', (req, res) => {
    // skicka nuvarande grej
    res.send({value: currentName});
});

app.get('/get-points', (req, res) => {
    // skicka nuvarande poäng
    res.send("current points");
});

app.get('/give-points', (req, res) => {
    // sök upp hemligt id
    // ge önskad poäng från hemligt id
    // lägg till hemligt id i har-röstat
    res.send("current points");
});

let currentName = "Nuvarande";
app.post('/set-current', (req, res) => {
    const { name } = req.body; // Extract the 'name' from the request body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
  
    console.log(`Received name: ${name}`); // Log the name to the console
    currentName = name;
  
    // You can add more logic here, e.g., storing the name in a database or performing other actions
  
    res.status(200).json({ message: `Name '${name}' is now set!` }); // Respond with a success message
  });