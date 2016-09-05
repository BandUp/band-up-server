// ========== Package import ==========
const express = require('express');
const expressSession = require('express-session');
const app = express();
const http = require('http').createServer(app);
const flash    = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// our files import
const User = require('./models/user');
const chat = require('./socket/chatserver');

// =========== app setup ===========
// this will cast an error on Heroku that we don't need to worry about
require('dotenv').config(); // get all app keys and app-secrets

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // need this for auth
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_CONNECTION); // IMPORTANT! set up .env file

chat.setup(http);
require('./config/passport')(passport);
app.use(expressSession({
  secret: 'mySecretKey',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


console.log('test');


// =========== app routes ===========
require('./routes')(app, passport);

// =========== app startup ===========
http.listen(port, () => {
  //console.log(process.env.TEST_STRING);
  console.log('Example app listening on port:' + port);
});
