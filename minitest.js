var io = require('socket.io-client');
var socket = io.connect('http://localhost', {port:3000});
socket.on('connect', () => {console.log('connection established');});
