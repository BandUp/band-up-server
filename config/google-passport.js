//const GoogleTokenStrategy = require('passport-google-token').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }, (token, refreshToken, profile, done) => {
          // asynchronous
          process.nextTick(() => {
            // look for pre-existing account
            User.findOne({'google.id': profile.id}, (err, user) => {
              if(err) return done(err);

              // if user is found log them in
              if(user){
                 return done(null, user);
               }
               else {
                 let newUser = new User();
                 newUser.google.id = profile.id;
                 newUser.google.token = token;
                 newUser.google.name = profile.displayName;
                 newUser.google.email = profile.emails[0].value;

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

