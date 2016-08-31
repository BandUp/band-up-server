// ========== Package import ==========
const express = require('express');
const app = express();
const http = require('http').Server(app);
const chat = require('./socket/chatserver');
const mongoose = require('mongoose');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

// =========== app setup ===========
require('dotenv').config(); // get all app keys and app-secrets
const port = process.env.PORT || 3000;
chat.setup(http);

mongoose.connect(process.env.MONGO_CONNECTION);

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
  console.log(process.env.TEST_STRING);
  console.log('Example app listening on port:' + port);
});
