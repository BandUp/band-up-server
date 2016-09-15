const Instrument = require('./models/instrument');
module.exports = function(app, passport){
  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.get('/login-facebook',
          passport.authenticate('facebook-token'),
          (req, res) => {
              res.json({sessionID: req.sessionID}).send(200);
  });

  app.post('/signup-local',
            passport.authenticate('local-signup'),
            (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    // Rafá was here ;p
    res.status(201).json({id: req.user._id}).send();
  });

  app.get('/nearby-users', (req, res) => {
      res.json([
        {name: 'Bergþór'},
        {name: 'Dagur'},
        {name: 'Elvar'},
        {name: 'Rafael'}
      ]);
  });

  app.post('/login-local',
            passport.authenticate('local-login', {
              failureFlash: true
            }),
            (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    res.status(200).json({sessionID: req.sessionID}).send();
  });

  app.post('/email', isLoggedIn, (req, res) => {
    // get current user into easy to handle variable
    let user = req.user;
    // update email
    user.email = req.body.email;
    user.save((err) => {
      res.status(200).send();
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.status(200).send();
  });

  // route middleware to make sure user is logged in
  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    // user is not authorized send 401 back
    res.status(401).send();
  }

  app.get('/instruments', (req, res) => {
    Instrument.find({}, function(err, doc) {
    	if (err) {
    		console.log("Error occurred:");
    		console.log(err);
    		res.status(500).send("Unknown internal server error occurred.");
    		return;
    	}
    	res.type('text/json');
    	res.status(200).send(doc);
    }).sort({order: 'ascending'});
  });

  app.get('/genres', (req, res) => {
    Genre.find({}, function(err, doc) {
      if (err) {
        console.log("Error occurred:");
        console.log(err);
        res.status(500).send("Unknown internal server error occurred.");
        return;
      }
      res.type('text/json');
      res.status(200).send(doc);
    }).sort({order: 'ascending'});
  });
};
