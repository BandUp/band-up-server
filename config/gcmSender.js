const gcm = require('node-gcm');
const Users = require('../models/user');

class gcmSender {
    constructor() {
        this.sender = new gcm.Sender(process.env.GOOGLE_SERVER_KEY);
    }

    /**
    * takes in sender user doc and reciever user doc
    * and sends match notification to reciever
    */
    sendMatchNotification(senderDoc, recieverDoc){
        let message = new gcm.Message({
            data: {
                from: senderDoc._id,
                type: "matchNotification"
            },
            notification: {
                title: "you have a new match!!!",
                icon: "ic_launcher",
                body: "user: " + senderDoc.username + "also likes your style"
            }
        });

        this.sender.send(message, {
            registrationToken: recieverDoc.gcmToken
        }, (err, response) => {
            if (err) console.log(err);
            else console.log(response);
        });
    }

    /**
    * takes in sender user id, reciever user id and a message string
    * finds reciever user doc and sends message to it
    */
    sendMsgNotification(senderid, recieverid, msg) {
        User.findOne({
            _id: recieverid
        }, (err, doc) => {
            let message = new gcm.Message({
                data: {
                    from: senderid,
                    type: "msgNotification"
                },
                notification: {
                    title: "you have a new message from someone",
                    icon: "ic_launcher",
                    body: msg
                }
            });

            this.sender.send(message, {
                registrationToken: doc.gcmToken
            }, (err, response) => {
                if (err) console.log(err);
                else console.log(response);
            });
        });
    }

    sendTestMessage(regTokens) {
        console.log("sending test message");
        let message = new gcm.Message({
            data: {
                key1: "Hello world!",
                type: "testNotification"
            },
            notification: {
                title: "hello world",
                icon: "ic_band_up_logo_notification",
                body: "this is a test message"
            },
            message: "here is a test message"
        });

        this.sender.send(message, {
            registrationTokens: regTokens
        }, (err, response) => {
            if (err) console.error(err);
            else console.log(response);
        });
    }
}

module.exports = new gcmSender();
