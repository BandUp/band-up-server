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
    console.log(username);
    // asynchronous
    // User.findOne won't fire unless data is sent back
    process.nextTick(function(){
      console.log('registering new user');
      // find user with same username (checking if this is a pre-existing user)
      User.findOne({'local.username': username}, (err, user) => {
        // if there was an error return it
        if(err){
          console.log(err.message);
          return done(err);
        }
        // see if we found a user
        if(user){
          return done(null, false, {message: "user already exists"});
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
              return res.status(500).json(err);
            }
            return done(err, newUser);
          });
        }
      });
    });
  }));

  // local login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, username, password, done){
    User.findOne({'local.username': username}, function(err, user){
      // start with error reporting
      if(err){
        console.log(err.message);
        return done(err);
      }
      // no user with username was found
      if(!user){
        return done(null, false, {message: 'No such user registered'});
      }
      // check wether the password is incorrect
      if(!user.validPassword(password)){
        return done(null, false, {message: 'incorrect password'});
      }

      // all checks passed, return succesful user
      return done(null, user);
    });
  }));
};
