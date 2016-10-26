// ========== Package import ==========
const express        = require('express');
const expressSession = require('express-session');
const app = express();

// HTTP object required for chat application
const http             = require('http').createServer(app);
const flash            = require('connect-flash');
const mongoose         = require('mongoose');
const passport         = require('passport');
const bodyParser       = require('body-parser');
const cookieParser     = require('cookie-parser');
const fileUpload       = require('express-fileupload');
const socketIo         = require('socket.io').listen(http);
const passportSocketIo = require('passport.socketio');
const MongoStore       = require('connect-mongo')(expressSession);

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
	skip: function(req, res) {
		return process.env.NODE_ENV === 'test';
	}
}));

app.use(cookieParser()); // need this for auth
app.use(bodyParser.json());
app.use(fileUpload());

// Use port 3000 if .env file doesn't have a specified port.
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
if (process.env.NODE_ENV === 'test') {
	mongoose.connect(process.env.MONGO_TEST);
} else {
	mongoose.connect(process.env.MONGO_CONNECTION); // IMPORTANT! set up .env file
}

// Session store for storing sessions in the database.
const mongoStore = new MongoStore({ mongooseConnection: mongoose.connection });

// Use passport for socket.io authentication.
socketIo.use(passportSocketIo.authorize({
	cookieParser: cookieParser,
	key:          'connect.sid',
	secret:       process.env.LOCAL_SECRET_KEY,
	store:        mongoStore
}));

app.gcmSender = require('./config/gcmSender');

chat.setup(http, app, socketIo);

// authentication setup
require('./config/passport')(passport);
app.use(expressSession({
	secret: process.env.LOCAL_SECRET_KEY,
	resave: true,
	saveUninitialized: true,
	store: mongoStore
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// =========== app routes ===========
require('./routes/routes')(app, passport);

// =========== app startup ===========
http.listen(port, () => {
	console.log('BandUp server listening on port ' + port + '.');
});