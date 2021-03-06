const User = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');
const shared = require('./shared');

module.exports = function(app, passport) {

	// returns user all data to client
	app.all('/user', isLoggedIn, (req, res) => {
		var userId = "";
		if (!req.body.userId) {
			userId = req.user._id;
		} else {
			userId = req.body.userId;
		}
		User.findById(userId, (err, userDoc) => {
			if (err || !userDoc) {
				res.status(500).send();
				console.log("error");
			} else if (userDoc) {
				shared.itemNamesToMap(instrument, (instruMap) => {
					shared.itemNamesToMap(genre, (genresMap) => {
						if (!instruMap || !genresMap) {
							res.status(500).send("Unknown internal server error occurred.");
							return;
						}
						let dto = shared.userToDTO(req.user, userDoc, instruMap, genresMap);
						res.status(200).send(dto);
					});
				});
			}
		});
	});

	app.get('/matches', isLoggedIn, (req, res) => {
		User.find({
			'_id': {
				$in: req.user.matched
			}
		}, (err, userDoc) => {
			if (err) {
				res.sendStatus(500);
				return;
			}
			let userList = [];
			shared.itemNamesToMap(instrument, (instruMap) => {
				shared.itemNamesToMap(genre, (genresMap) => {
					if (!instruMap || !genresMap) {
						res.status(500).send("Unknown internal server error occurred.");
						return;
					}

					for (let i = 0; i < userDoc.length; i++) {
						let userDTO = shared.userToDTO(req.user, userDoc[i], instruMap, genresMap);
						if (userDTO) {
							userList.push(userDTO);
						}
					}
					res.status(200).send(userList);
				});
			});
		});
	});

	app.all('/get-instrument', (req, res) => {
		instrument.findById(req.body.id, (err, doc) => {
			if (err) {
				res.sendStatus(500);
				return;
			} else {
				res.status(200).send(doc);
			}
		});
	});

	app.post("/soundcloudid", isLoggedIn, (req, res) => {
		req.user.soundCloudId = req.body.soundCloudId;
		req.user.save((err) => {
			res.status(200).json({}).send();
		});
	});

	// takes in a user object and modifies current user
	app.all('/edit-user', isLoggedIn, (req, res) => {
		let editedUser = req.body;
		let origUser = req.user;
		console.log(editedUser);

		for (let attrName of Object.keys(editedUser)) {
			if (editedUser[attrName] != origUser[attrName]) {
				origUser[attrName] = editedUser[attrName];
			}
		}

		origUser.save((err) => {
			if (err) throw err;
			res.json(origUser).status(200).send();
		});
	});

	app.post('/gcmRegToken', isLoggedIn, (req, res) => {
		req.user.gcmToken = req.body.regToken;

		req.user.save((err) => {
			res.json({}).status(200);
		});

	});

	app.post("/soundcloudurl", isLoggedIn, (req, res) => {
		req.user.soundcloudURL = req.body.soundcloudurl;
		req.user.soundCloudSongName = req.body.soundcloudsongname;
		req.user.save((err) => {
			if (err) throw err;
			res.json({}).status(200);
		});
	});

	app.delete("/user-delete", isLoggedIn, (req, res) => {
		User.remove({
			"_id": req.user._id
		}, (err) => {
			if (err) throw err;
			res.json({}).status(204);
		});
	});

};

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	// user is not authorized send 401 back
	res.status(401).send("You are not authorized to access this data.");
}
