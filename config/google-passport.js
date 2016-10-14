const GoogleStrategy = require('passport-google-token').Strategy;

// load up user model
const User = require('../models/user');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT,
    clientSecret: process.env.GOOGLE_SECRET
  }, (token, refreshToken, profile, done) => {
    process.nextTick(() => {
    	console.log("HAHAH");
      User.findOne({'google.id': profile.id}, (err, user) => {
        console.log("AHAH");
        if(err) {
        	console.log("ERROR");
        	return done(err);
        }
        if(user) {
        	console.log("USER");
          return done(null, user);
        } else {
          let newUser = new User();
          newUser.google.id = profile.id;
          newUser.google.token = token;
          newUser.username = profile.displayName;
          newUser.email = profile.emails[0].value;

          newUser.save((err) => {
            if(err) throw err;

            // if succesful return the new user
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
