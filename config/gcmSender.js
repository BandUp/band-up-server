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
	sendMatchNotification(senderDoc, receiverDoc) {
		let message = new gcm.Message({
			to : receiverDoc.gcmToken,
			notification: {
				title: "New Match!",
				icon: "ic_band_up_notification",
				body: "You have matched with " + senderDoc.username
			},

			data: {
				type: "matchNotification"
			}
		});
		
		this.sender.send(message, {
			registrationTokens: [receiverDoc.gcmToken]
		}, (err, response) => {
			if (err) console.log(err);
			else console.log(response);
		});
	}

	/**
	 * takes in sender user id, reciever user id and a message string
	 * finds reciever user doc and sends message to it
	 */
	sendMsgNotification(senderid, recieverid, username, msg) {
		Users.findOne({
			_id: recieverid
		}, (err, doc) => {
			let message = new gcm.Message({
			to : doc.gcmToken,
			notification: {
				title: "New Chat Message",
				icon: "ic_band_up_notification",
				body: username + ": " + msg
			},

			data: {
				senderId: senderid,
				senderName: username,
				type: "msgNotification"
			}
		});

			this.sender.send(message, {
				registrationTokens: [doc.gcmToken]
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
				title: "Hello World!",
				icon: "ic_band_up_notification",
				body: "This is a test message."
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
