const chat = require('../models/chatHistory');

module.exports.setup = function(server) {
    const socketPort = 8080;
    console.log("Socket instance for chat starting on port " + socketPort);
    var io = require('socket.io').listen(server);

    //Global user object, since we want to know what rooms each user is in etc.
    var users = {};

    io.on('connection', function(socket) {
        console.log("Client connected");

        //This gets performed when a user joins the server.
        socket.on('adduser', function(username, fn) {
            //Check if username is avaliable.
            console.log(users[username] === undefined);
            console.log(username.toLowerCase != "server");
            console.log(username.length < 30);
            if (users[username] === undefined && username.toLowerCase != "server" && username.length < 30) {

                socket.username = username;

                //Store user object in global user roster.
                users[username] = {
                    username: socket.username,
                    channels: {},
                    socket: this
                };
                console.log("Username available. Adding user: " + username);
                fn(true); // Callback, user name was available
            } else {
                console.log("Username " + username + "unavailable.");
                fn(false); // Callback, it wasn't available
            }
        });

        socket.on('privatemsg', function(msgObj, fn) {
            if (socket.username === undefined) {
                // We don't know who this is.
                fn(false);
                return;
            }

            var mg = {
                sender: socket.username,
                message: msgObj.message,
                timestamp: Date.now()
            };
            var userList = [socket.username, msgObj.nick].sort();
            console.log("USERS");
            console.log(socket.username);
            console.log(msgObj.nick);
            chat.findOneAndUpdate({
                    users: userList
                }, {
                    $push: {
                        chatHistory: mg
                    }
                }, {
                    safe: true,
                    upsert: true
                },
                function(err, doc) {
                    if (err) {
                        console.log("Error occurred:");
                        console.log(err);
                        return;
                    }
                });

            // If user exists in global user list.
            if (users[msgObj.nick] !== undefined) {
                //Send the message only to this user.
                console.log("Sending message '" + msgObj.message + "' to " + msgObj.nick);
                users[msgObj.nick].socket.emit('recv_privatemsg', socket.username, msgObj.message);
                //Callback recieves true.
                fn(true);
            }
            fn(false);
        });

        socket.on('disconnect', function() {
            console.log("Client disconnected");
            if (socket.username) {
                //Remove the user from the global user roster.
                delete users[socket.username];
            }
        });
    });
    console.log('chat is setup and ready');
};
