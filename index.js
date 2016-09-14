// ========== Package import ==========
const express = require('express');
const expressSession = require('express-session');
const app = express();
// http object required for chat application
const http = require('http').createServer(app);
const flash    = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// logging
const morgan = require('morgan');

// our files import
const User = require('./models/user');
const chat = require('./socket/chatserver');

// needed for testing
module.exports = http;
// =========== app setup ===========
var env = process.env.NODE_ENV || 'dev';
// this will cast an error on Heroku that we don't need to worry about
require('dotenv').config();

app.use(morgan('dev', {
  // skip logs in tests else log everything to console
  skip: function(req, res) {return process.env.NODE_ENV === 'test';}
}));
app.use(cookieParser()); // need this for auth
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
if(process.env.NODE_ENV === 'test'){
  mongoose.connect(process.env.MONGO_TEST);
}else{
  mongoose.connect(process.env.MONGO_CONNECTION); // IMPORTANT! set up .env file
}

chat.setup(http);

// authentication setup
require('./config/passport')(passport);
app.use(expressSession({
  secret: 'mySecretKey',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// =========== app routes ===========
require('./routes')(app, passport);

// =========== app startup ===========
http.listen(port, () => {
  console.log('Example app listening on port:' + port);
});
