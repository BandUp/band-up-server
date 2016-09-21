
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.use(new GoogleTokenStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  ));
};

