const User = require('../models/user');
const guid = require("node-uuid");
const path = require("path");

module.exports = function(app, passport) {

	/**
	 * create a new user account using the local strategy
	 * also sends an email to require user validation to prevent bots from overflowing the system
	 */
	app.post('/signup-local', passport.authenticate('local-signup'), (req, res) => {
		// this function only gets called when signup was succesful
		// req.user contains authenticated user.
		// Rafá was here ;p
		req.user.location = {};
		req.user.location.lat = 0;
		req.user.location.lon = 0;
		req.user.location.valid = false;

		req.user.image = {};
		req.user.image.url = "";
		req.user.image.public_id = "";

		//*/ set validation token (if it is not empty in a week we remove the user)
		req.user.validToken = guid.v4();
		app.mailer.sendValidationEmail(req.user);
		setTimeout(function(){
			User.findById(req.user._id, (err, doc) =>{
				if(doc.validToken){
					doc.remove();
				}
			});
		}, 7 * 86400000);//*/
		req.user.save((err) => {
			res.status(201).json({
				id: req.user._id
			}).send();
		})
	});

	/**
	 * login user with the local strategy and recieve an OAuth cookie
	 */
	app.post('/login-local',
		passport.authenticate('local-login', {
			failureFlash: true
		}),
		(req, res) => {
			// this function only gets called when signup was succesful
			// req.user contains authenticated user.
			let sendObject = {
				sessionID: req.sessionID,
				hasFinishedSetup: req.user.hasFinishedSetup,
				userID: req.user._id
			};
			res.status(200).json(sendObject).send();
		});

	/**
	 * terminate the current session
	 * does nothing if user is not loged in
	 */
	app.get('/logout', (req, res) => {
		req.logout();
		res.status(200).send("{}");
	});

	/**
	 * utility path to check wether the user is logged in
	 * @type {Boolean}
	 */
	app.get('/isLoggedIn', (req, res) => {
		if (!req.user) {
			res.json({
				isLoggedIn: false,
				hasFinishedSetup: false
			});
		} else {
			res.json({
				isLoggedIn: req.isAuthenticated(),
				hasFinishedSetup: req.user.hasFinishedSetup
			});
		}
	});

	/**
	 * log in or create new user using facebook-token
	 * requires a valid facebook auth token in body
	 */
	app.post('/login-facebook',
		passport.authenticate('facebook-token'),
		(req, res) => {
			res.json({
				sessionID: req.sessionID,
				userID: req.user._id,
				hasFinishedSetup: req.user.hasFinishedSetup,
			});
		});

	/**
	 * log in or create new user using google id token
	 * requires google id token which is encoded user information
	 */
	app.post('/login-google',
		passport.authenticate(['google-id-token-android', 'google-id-token-ios']),
		(req, res) => {
			res.json({
				sessionID: req.sessionID,
				userID: req.user._id,
				hasFinishedSetup: req.user.hasFinishedSetup
			});
		});

	/**
	 * log in or create new user using soundcloud-token
	 * requires a valid soundcloud auth token in body
	 */
	app.get('/login-soundcloud',
		passport.authenticate('soundcloud-token'),
		(req, res) => {
			req.user.email = req.body.email;
			console.log(req);
			res.json({
				sessionID: req.sessionID,
				userID: req.user._id,
				hasFinishedSetup: req.user.hasFinishedSetup,
			});
		});

	/**
	 * set the email for currently logged in user
	 */
	app.post('/email', (req, res) => {
		if (!req.body.email) {
			res.status(412).send("{}");
			return;
		}

		User.findOne({
			'email': req.body.email
		}, (err, user) => {
			if (err) {
				console.log(err.message);
				res.status(500).send("{}");
				return;
			}

            if (user) {
                res.json({
                    emailInUse: true
                });
            } else {
                res.json({
                    emailInUse: false
                });
            }
        });
    });

    /**
     * send an email to user with coresponding email address
     * to allow him to reset his/her password
     */
	app.post('/reset-password', (req, res) =>{
		User.findOne({email: req.body.email}, (err, doc) =>{
			if (err) {
				res.json({succesfull: false}).status(500);
				return;
			}
			
			if (!doc) {
				res.json({succesfull: false}).status(404);
				return;
			}

			doc.resetToken = guid.v4();
			app.mailer.sendPaswordReset(doc);
			setTimeout(() => {
				doc.resetToken = "";
			}, 86400000); // wait for 24 hours
			doc.save((err) =>{
				if(err) throw err;
				res.json({succesfull: true, token: doc.resetToken}).status(200);
			});
		});
	});

    /**
     * create webpage to allow the user to reset his/her password
     */
	app.get('/reset-password/:token', (req, res) =>{
		User.findOne({resetToken: req.params.token}, (err, doc) =>{
			// todo: render html to allow user to create new password
			if (err) {
				console.log(err);
				res.status(404);
				return;
			}else if(doc){
				res.sendFile(path.join(__dirname + '/../static/reset-password.html'));
			}else{
				res.sendFile(path.join(__dirname + '/../static/404.html'));
			}

		});
	});

    /**
     * resets the password of user with the corresponding resetToken
     * to the password provided in req.body.password
     */
	app.post('/reset-password/send', (req, res) =>{
		console.log(req.body);
		User.findOne({resetToken: req.body.token}, (err, doc) =>{
			console.log(doc);
			doc.local.password = doc.generateHash(req.body.password);
			doc.resetToken = "";
			doc.save((err) =>{
				console.log("saved");
				if (err) throw err;
				// todo: send a nice html page
				res.status(200).send();
			});
		});
	});

	/**
	 * set user as validated
	 */
	app.get('/validate/:token', (req, res) =>{

		User.findOne({validToken: req.params.token}, (err1, doc) => {
			if (err1) throw err1;
			if (!doc) {
				res.sendFile(path.join(__dirname + '/../static/404.html'));
				return;
			} 


			doc.validToken = "";
			doc.save((err2) => {
				if(err2) throw err2;
				res.sendFile(path.join(__dirname + '/../static/validate.html'));
			});
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
