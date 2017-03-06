const GoogleStrategy = require('passport-google-id-token');

// load up user model
const User = require('../models/user');

module.exports = function(passport) {

	var loginHandler = function(parsedToken, googleId, done) {
		// asynchronous
		process.nextTick(() => {
			// look for pre-existing account
			User.findOne({ "$or":[
				{'google.id': googleId},
				{'email': parsedToken.payload.email}
			]
			}, (err, user) => {
				if (err) return done(err);

				// if user is found log them in
				if (user) {
					if (!user.google) {
						user.google = { id: googleId};
					}
					return done(null, user);
				} else {
					let newUser = new User();
					// googleId is to authenticate a user to google.
					newUser.google.id = googleId;
					// parsedToken has all the information about the user.
					newUser.username = parsedToken.payload.name;
					newUser.email = parsedToken.payload.email;
					newUser.image.url = parsedToken.payload.picture;
					newUser.image.public_id = null;

					newUser.save((err) => {
						if (err) throw err;

						// if succesful return the new user
						return done(null, newUser);
					});
				}
			});
		});
	};

	passport.use('google-id-token-android', new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID
	}, loginHandler));

	passport.use('google-id-token-ios', new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID_IOS
	}, loginHandler));

};
