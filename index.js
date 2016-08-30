// ========== Package import ==========
const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const chat = require('./socket/chatserver');
chat.setup(http);

// =========== app setup ===========
app.get('/', (req, res) => {
  res.send('Hello World! and nice to see you');
});

// get all profiles in range
app.get('/profiles', (req, res) => {
  // TODO: current version is a prototype must implement!
  res.json([
  		{name: 'Bergþór'},
  		{name: 'Dagur'},
  		{name: 'Elvar'},
  		{name: 'Rafael'}
  	]);
});

// =========== app startup ===========
app.listen(port, () => {
  console.log('Example app listening on port:' + port);
});
