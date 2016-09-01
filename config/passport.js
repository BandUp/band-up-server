const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport){
  // we need the following two functions for session tokens
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // Local Signup
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, username, password, done){
    // asynchronous
    // User.findOne won't fire unless data is sent back
    process.nextTick(function(){
      // find user with same username (checking if this is a pre-existing user)
      User.findOne({'local.username': username}, (err, user) => {
        // if there was an error return it
        if(err){
          return done(err);
        }
        // see if we found a user
        if(user){
          return done(null, false,
            req.flash('signupMessage', 'username is already taken'));
        }else{
          // no user with said username
          // create user
          let newUser = new User();

          // set local credentials
          newUser.local.username = username;
          newUser.local.password = newUser.generateHash(password);

          // attempt to save user
          newUser.save((err) =>{
            if(err){
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
