const chat = require('../models/chatHistory');

module.exports.setup = function socketioApp(server, app, io) {
    // Global user object, since we want to know what rooms each user is in etc.
    var users = {};

    io.on('connection', function(socket) {
        console.log("Client connected");

        // This gets performed when a user joins the server.
        socket.on('adduser', function(username, fn) {
            // user data from the socket.io passport middleware
            if (socket.request.user && socket.request.user.logged_in) {
                // Set the username as the ID of the user.
                socket.username = socket.request.user._id;

                // Store user object in global user roster.
                users[username] = {
                    username: socket.username,
                    socket: this
                };
                fn(true);
            } else {
                fn(false);
            }
        });

        socket.on('privatemsg', function(msgObj, fn) {
            if (socket.request.user && socket.request.user.logged_in) {
                socket.username = socket.request.user._id;

                if (socket.username === undefined) {
                    // We don't know who this is.
                    fn(false);
                    return;
                }

                const msg = {
                    sender: socket.username,
                    message: msgObj.message,
                    timestamp: Date.now()
                };

                const userList = [socket.username, msgObj.nick].sort();
                chat.findOneAndUpdate({
                        users: userList
                    }, {
                        $push: {
                            chatHistory: msg
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
                    // Send the message only to this user.
                    users[msgObj.nick].socket.emit('recv_privatemsg', socket.username, msgObj.message);
                    // Callback recieves true.
                    fn(true);
                } else {
                    app.gcmSender.sendMsgNotification(socket.username, msgObj.nick, msgObj.message);
                }
                fn(false);
            } else {
                console.log("User not logged in.");
            }
        });

        socket.on('disconnect', function() {
            console.log("Client disconnected");
            if (socket.username) {
                //Remove the user from the global user roster.
                delete users[socket.username];
            }
        });
    });
    console.log('Socket.IO for chat ready.');
};
