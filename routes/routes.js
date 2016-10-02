const user = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');

module.exports = function(app, passport){

  require('./login-signup')(app, passport);

  app.post('location', isLoggedIn, (req, res) => {
    if(!req.body.location){throw "need location info in body";}
    let currUser = req.user;
    currUser.location.x = req.body.location.x;
    currUser.location.y = req.body.location.y;

    currUser.save((err) => {
      if(err) throw err;
      res.sendStatus(200);
    });
  });

  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.get('/nearby-users', (req, res) => {
    /*
    let query = user.find();
    query.exists('this.location');
    query.exec(function(err, doc){
      console.log(doc);
      res.json(doc).sendStatus(200);
    });
    */

      res.json([
        {username: 'Bergþór', instruments:["Piano", "Drums"], genres:["Pop", "Country"], status:"Searching for a band", distance:10, percentage:95, profileImgUrl:"http://placekitten.com/200/200"},
        {username: 'Dagur', instruments:["Guitar", "Bass"], genres:["Rock", "Electronic"], status:"Searching for a band", distance:13, percentage:80, profileImgUrl:"http://placekitten.com/210/210"},
        {username: 'Elvar', instruments:["Vocals", "Percussion"], genres:["Hip Hop", "Jazz"], status:"Looking for a pianist", distance:15, percentage:75, profileImgUrl:"http://placekitten.com/220/220"},
        {username: 'Rafael', instruments:["Harmonica", "Keyboard"], genres:["Indie", "Pop"], status:"Looking for a singer", distance:25, percentage:70, profileImgUrl:"http://placekitten.com/240/240"}
      ]);
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
	app.post('/profile-picture', isLoggedIn, function(req, res) {
	    
	 	const supportedFileTypes = ["image/jpeg", "image/png"];

	    if (!req.files) {
	        result = {err:6, msg:"No files uploaded."};
	  		res.status(412).send(result);
	        return;
	    }

	    if (req.files.length > 1) {
			result = {err:5, msg:"Only upload one image at a time."};
	  		res.status(412).send(result);
	  		return;
	    }

	    const sampleFile = req.files.fileUpload;

		if (supportedFileTypes.indexOf(sampleFile.mimetype) === -1) {
			result = {err:7, msg:"File type not supported"};
	  		res.status(412).send(result);
	  		return;
		}

		const imgFolder = "img/";

	    sampleFile.mv(imgFolder + 'filename.jpg', function(err) {
	        if (err) {
	            res.status(500).send(err);
	        }
	        else {
	            res.send('File uploaded!');
	        }
	    });
	});
};
