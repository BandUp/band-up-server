const User = require('../models/user');

module.exports = function(app, passport) {
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

    res.status(201).json({id: req.user._id}).send();
  });

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

  app.get('/logout', (req, res) => {
    req.logout();
    res.status(200).send();
  });

  app.get('/isloggedIn', (req, res) => {
    res.json({loggedIn: req.isAuthenticated()}).end();
  });

  app.post('/login-facebook',
          passport.authenticate('facebook-token'),
          (req, res) => {
              res.json({sessionID: req.sessionID, userID: req.user._id});
  });

  app.get('/login-google',
            passport.authenticate('google-token'),
            (req, res) => {
                res.json({sessionID: req.sessionID, userID: req.user._id});
  });

  app.get('/login-soundcloud',
            passport.authenticate('soundcloud-token'),
            (req, res) => {
              req.user.email = req.body.email;
              console.log(req);
                res.json({sessionID: req.sessionID, userID: req.user._id});
  });

 /* // Storing data of already signed in user on app
  app.post('/login-google', (req, res) => {
      User.findOne({'google.id': req.body.userId}, (err, doc) => {
        if(err) {
            res.status(500).send();
        }
        if(doc) {
            res.json({sessionID: req.sessionID}).send();
        }
        else {
            let newUser = new User();
            newUser.google.id = req.body.userId;
            newUser.google.token = req.body.userToken;
            newUser.username = req.body.userName;
            newUser.email = req.body.userEmail;
            newUser.save();
            res.json({sessionID: req.sessionID, userID: req.user._id}).send();
        }
      });
  });*/


 app.post('/login-google', passport.authenticate('google-token', { scope: 'https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}), (req, res) => {
         	console.log("HELLO");
         	console.log(req.user);
             res.json({sessionID: req.sessionID,userID: req.user._id});
 });

};

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  // user is not authorized send 401 back
  res.status(401).send("You are not authorized to access this data.");
}
