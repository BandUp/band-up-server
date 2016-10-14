const LocalStrategy = require('passport-local').Strategy;

// load up user model
const User = require('../models/user');

module.exports = function(passport){
  // facebook authentication
  require('./facebook-passport')(passport);
  // google
  require('./google-passport')(passport);
  // soundcloud
  require('./soundcloud-passport')(passport);

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
      User.findOne({'username': username}, (err, user) => {
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
          newUser.username = username;
          newUser.local.password = newUser.generateHash(password);
          newUser.email          = req.body.email;
          newUser.local.age      = req.body.age;

          // attempt to save user
          newUser.save((err) =>{
            if(err){
              return done(err);
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
    User.findOne({'username': username}, function(err, user){
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
