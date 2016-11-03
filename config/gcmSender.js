/**
* a wraper class for GCM sender used for notifications
*
* all notification must follow the bellow chema
*
* {
*   data: {
*       // all metadata for notification handling, for instance in the case of match notification
*       type: "match"
*       from_id: "89jafnn043jkldfasdfasdf" // an example userID
*       from_name: "ExampleName"
*   }
*   notification: {
*       title: "an example title for notification"
*       icon: "ic_name_of_icon" // this field is not currently used on android side
*       body: "message text"
*   }
* }
*/

const gcm = require('node-gcm');
const Users = require('../models/user');

class gcmSender {
    constructor() {
        this.sender = new gcm.Sender(process.env.GOOGLE_SERVER_KEY);
    }

    sendMsgNotification(senderid, recieverid, msg) {
        User.findOne({
            _id: recieverid
        }, (err, doc) => {
            let message = new gcm.Message({
                data: {
                    from: senderid,
                    type: "message"
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

    sendTestMessage(regToken) {
        console.log("sending test message");
        let message = new gcm.Message({
            data: {
                type: "test"
            },
            notification: {
                title: "hello world",
                icon: "ic_band_up_logo_notification",
                body: "this is a test message"
            }
        });

        this.sender.send(message, {
            registrationToken: regToken
        }, (err, response) => {
            if (err) console.error(err);
            else console.log(response);
        });
    }
}

module.exports = new gcmSender();
