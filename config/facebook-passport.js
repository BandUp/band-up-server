const FacebookStrategy = require('passport-facebook-token');

// load up user model
const User = require('../models/user');

module.exports = function(passport) {
	passport.use(new FacebookStrategy({
		clientID: process.env.FACEBOOK_CLIENT,
		clientSecret: process.env.FACEBOOK_SECRET,
	}, (token, refreshToken, profile, done) => {
		// asynchronous
		process.nextTick(() => {
			// look for pre-existing account
			
			var query = [{'facebook.id': profile.id}];
			
			if (profile.emails.length !== 0) {
				if (profile.emails[0].value) {
					query.push({'email': profile.emails[0].value});
				}
			}

			User.findOne({ '$or': query }, (err, user) => {
				if (err) return done(err);

				// if user is found log them in
				if (user) {
					if (!user.facebook) {
						user.facebook = {
							id: profile.id,
							token: token
						};
						user.save((err) =>{
							return done(null, user);
						});
					}else{
						return done(null, user);
					}
				} else {
					// no user found with facebok id, time to create one
					let newUser = new User();
					newUser.facebook.id = profile.id;
					newUser.facebook.token = token;
					newUser.username = profile.name.givenName;
					newUser.email = profile.emails[0].value; // facebook returns multiple emails

					newUser.save((err) => {
						if (err) throw err;

						// if succesful return the new user
						return done(null, newUser);
					});
				}
			});
		});
	}));
};
