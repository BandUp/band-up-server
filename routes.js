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

  // Storing data of already signed in user on app
app.post('/login-google', (req, res) => {
      user.findOne({'google.id': req.body.userId}, (err, doc) => {
        if(err) {
            res.status(500).send();
        }
        if(doc) {
            res.json({sessionID: req.sessionID}).send();
        }
        else {
            let newUser = new user();
            newUser.google.id = req.body.userId;
            newUser.google.token = req.body.userToken;
            newUser.username = req.body.userName;
            newUser.email = req.body.userEmail;
            newUser.save();

            res.json({sessionID: req.sessionID}).send();
        }
      });
  });

   /*
  app.post('/login-google-token',
          passport.authenticate('google-token', { scope : ['profile', 'email'] }),
          (req, res) => {
              res.json({sessionID: req.sessionID});
  });
  */

  app.post('/signup-local', passport.authenticate('local-signup'), (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    // Rafá was here ;p
    res.status(201).json({id: req.user._id}).send();
  });

  app.get('/isloggedIn', (req, res) => {
    res.json({loggedIn: req.isAuthenticated()}).end();
  });

  app.get('/nearby-users', (req, res) => {
    let query = user.find();
    query.exists('this.location');
    query.exec(function(err, doc){
      console.log(doc);
      res.json(doc).sendStatus(200);
    });

    /*
      res.json([
        {username: 'Bergþór', instruments:["Piano", "Drums"], genres:["Pop", "Country"], status:"Searching for a band", distance:10, percentage:95, profileImgUrl:"http://placekitten.com/200/200"},
        {username: 'Dagur', instruments:["Guitar", "Bass"], genres:["Rock", "Electronic"], status:"Searching for a band", distance:13, percentage:80, profileImgUrl:"http://placekitten.com/210/210"},
        {username: 'Elvar', instruments:["Vocals", "Percussion"], genres:["Hip Hop", "Jazz"], status:"Looking for a pianist", distance:15, percentage:75, profileImgUrl:"http://placekitten.com/220/220"},
        {username: 'Rafael', instruments:["Harmonica", "Keyboard"], genres:["Indie", "Pop"], status:"Looking for a singer", distance:25, percentage:70, profileImgUrl:"http://placekitten.com/240/240"}
      ]);*/
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
    	res.status(200).json(doc);
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
      	var result;
      	instrument.find({}, function(err, instruDoc) {
	      if (err) {
	        console.log("Error occurred:");
	        console.log(err);
	        res.status(500).send("Unknown internal server error occurred.");
	        return;
	      }
	      result = instruDoc.map(function(a) {return a._id.toString();});
	      if (validateSetupSelection(req, res, result)) {
	      	doc.instruments = req.body;
	      	doc.save();
	      	res.status(201).send("{}");
	      }
	    });
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
			return;
      	}
      	var result;
      	genre.find({}, function(err, genreDoc) {
	      if (err) {
	        console.log("Error occurred:");
	        console.log(err);
	        res.status(500).send("Unknown internal server error occurred.");
	        return;
	      }
	      result = genreDoc.map(function(a) {return a._id.toString();});
		    if (validateSetupSelection(req, res, result)) {
		      	doc.genres = req.body;
		      	if (doc.genres.length > 0 && doc.genres.length > 0) {
					//doc.hasFinishedSetup = true;
		      	}
		      	doc.save();
		      	res.status(201).send("{}");
	      	}
	    });
  	});
  });

  function validateSetupSelection(req, res, ids) {
		var result;
		for (var i = 0; i < req.body.length; i++) {
			if (ids.indexOf(req.body[i]) === -1) {
				result = {err:4, msg:"Invalid ID"};
				res.status(412).send(result);
				return false;
			}
		}

		if (!req) {
			result = {err:0, msg:"Precondition Failed"};
			res.status(412).send(result);
			return false;
		}
		if (!req.body) {
			result = {err:1, msg:"The body is empty"};
	  		res.status(412).send(result);
	  		return false;
	  	}

	  	if (!Array.isArray(req.body)) {
	  		result = {err:2, msg:"Needs to be an array"};
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
 
	app.post('/upload', function(req, res) {
	    var sampleFile;
	 
	    if (!req.files) {
	        res.send('No files were uploaded.');
	        return;
	    }
	    console.log("sampleFile");
	 	console.log(req.files.fileUpload);
	    sampleFile = req.files.fileUpload;

	    sampleFile.mv('img/filename.jpg', function(err) {
	        if (err) {
	            res.status(500).send(err);
	        }
	        else {
	            res.send('File uploaded!');
	        }
	    });
	});
};
