// ========== Package import ==========
const express = require('express');
const expressSession = require('express-session');
const app = express();
const http = require('http').Server(app);
const flash    = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');

// our files import
const User = require('./models/user');
const chat = require('./socket/chatserver');

// =========== app setup ===========
require('dotenv').config(); // get all app keys and app-secrets

const port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGO_CONNECTION);

chat.setup(http);

app.use(expressSession({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
console.log('test');


// =========== app routes ===========
require('./routes')(app, passport);

// =========== app startup ===========
app.listen(port, () => {
  console.log('Example app listening on port:' + port);
});
