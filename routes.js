const user = require('./models/user');
const instrument = require('./models/instrument');
const genre = require('./models/genre');

module.exports = function(app, passport){
  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.post('/login-facebook',
          passport.authenticate('facebook-token'),
          (req, res) => {
              res.json({sessionID: req.sessionID});
  });

  // google
  app.get('/login-google',
            passport.authenticate('google'),
            (req, res) => {
                res.json({sessionID: req.sessionID});
  });

  app.post('/login-google-token',
          passport.authenticate('google-token', { scope : ['profile', 'email'] }),
          (req, res) => {
              res.json({sessionID: req.sessionID});
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
    res.status(200).json({sessionID: req.sessionID,  hasFinishedSetup: req.user.hasFinishedSetup}).send();
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
    res.status(401).send("You are not authorized to access this data.");
  }

  app.get('/instruments', isLoggedIn, (req, res) => {
    instrument.find({}, function(err, doc) {
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

  app.get('/genres', isLoggedIn, (req, res) => {
    genre.find({}, function(err, doc) {
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

  app.post('/instruments', isLoggedIn, (req, res) => {
  	user.findOne({_id:req.user._id}, function(err, doc) {
  		if (err) {
	        console.log("Error occurred:");
	        console.log(err);
			result = {err:5, msg:"Unknown internal server error occurred."};
			res.status(500).send(result);
			return;
      	}

      	if (!doc) {
      		result = {err:4, msg:"Unknown internal server error occurred."};
			res.status(500).send(result);
      	}

		if (validateSetupSelection(req, res)) {
	      	doc.instruments = req.body;
	      	doc.save();
	      	res.status(201).send("{}");
	    }
  	});
  });

  app.post('/genres', isLoggedIn, (req, res) => {
      	user.findOne({_id:req.user._id}, function(err, doc) {
  		if (err) {
	        console.log("Error occurred:");
	        console.log(err);
			result = {err:5, msg:"Unknown internal server error occurred."};
			res.status(500).send(result);
			return;
      	}

      	if (!doc) {
      		result = {err:4, msg:"Unknown internal server error occurred."};
			res.status(500).send(result);
      	}

      	if (validateSetupSelection(req, res)) {
	      	doc.genres = req.body;
	      	if (doc.genres.length > 0 && doc.genres.length > 0) {
				doc.hasFinishedSetup = true;
	      	}
	      	doc.save();
	      	res.status(201).send("{}");
      	}
  	});
  });

  function validateSetupSelection(req, res) {
		var result;
		if (!req) {
			result = {err:0, msg:"Precondition Failed"};
			res.status(412).send(result);
			return false;
		}
		if (!req.body) {
			result = {err:1, msg:"Precondition Failed"};
	  		res.status(412).send(result);
	  		return false;
	  	}

	  	if (!Array.isArray(req.body)) {
	  		result = {err:2, msg:"Precondition Failed"};
	  		res.status(412).send(result);
	  		return false;
	  	}

	  	if (req.body.length === 0) {
	  		result = {err:3, msg:"You need to select at least one item"};
	  		res.status(412).send(result);
	  		return false;
	  	}
	  	return true;
  }
};
