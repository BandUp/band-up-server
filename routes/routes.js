const user = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const cloudinary = require('cloudinary');
const geolib = require('geolib');

module.exports = function(app, passport){

  require('./login-signup')(app, passport);

  app.post('location', isLoggedIn, (req, res) => {
    if(!req.body.location){throw "need location info in body";}
    let currUser = req.user;
    currUser.location.lat = req.body.location.lat;
    currUser.location.lon = req.body.location.lon;

    currUser.save((err) => {
      if(err) throw err;
      res.sendStatus(200);
    });
  });

  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

    // returns user all data to client
    app.all('/get-user', (req, res) => {
        //console.log("id is: "+req.body.userId);
        user.findById(req.body.userId, (err, doc) => {
        //console.log(doc);
        if(err || !doc) {
            res.status(500).send();
              console.log("error");
        }
        else if (doc) {
          res.json(doc);
        }
        });
    });

  app.get('/nearby-users', isLoggedIn, (req, res) => {
    /*
    let query = user.find();
    query.exists('this.location');
    query.exec(function(err, doc){
      console.log(doc);
      res.json(doc).sendStatus(200);
    });
    */

    user.find({'_id': {$ne: req.user._id}}, function(err, userDoc) {
    	if (err) {
    		console.log("Error occurred:");
    		console.log(err);
    		res.status(500).send("Unknown internal server error occurred.");
    		return;
    	}
    	let userList = [];

    	instrument.find({}, (err, insDoc) => {
    		if (err) {
	    		console.log("Error occurred:");
	    		console.log(err);
	    		res.status(500).send("Unknown internal server error occurred.");
	    		return;
    		}
    		let insMap = {};

    		for (let i = 0; i < insDoc.length; i++) {
    			insMap[insDoc[i]._id] = insDoc[i].name;
    		}

	    	genre.find({}, (err, genDoc) => {
	    		if (err) {
		    		console.log("Error occurred:");
		    		console.log(err);
		    		res.status(500).send("Unknown internal server error occurred.");
		    		return;
	    		}
	    		let genMap = {};
	    		for (let i = 0; i < genDoc.length; i++) {
    				genMap[genDoc[i]._id] = genDoc[i].name;
    			}

		    	for (let i = 0; i < userDoc.length; i++) {
					let distanceToUser;
					if (req.user.location.valid && userDoc[i].location.valid) {
						distanceToUser = geolib.getDistance(
					    {
					    	latitude: req.user.location.lat,
					    	longitude:req.user.location.lon
					    },
						{
							latitude: userDoc[i].location.lat,
							longitude: userDoc[i].location.lon
						});

						distanceToUser /= 1000;
	    			} else {
	    				distanceToUser = null;
	    			}

					let user = {
						_id: userDoc[i]._id,
						username: userDoc[i].username,
						status: "Not Implemented",
						instruments:[],
						genres:[],
						distance: distanceToUser,
						percentage:0,
						image:userDoc[i].image
					};

					for (let j = 0; j < userDoc[i].instruments.length; j++) {
						user.instruments.push(insMap[userDoc[i].instruments[j]]);
					}

					for (let j = 0; j < userDoc[i].genres.length; j++) {
						user.genres.push(genMap[userDoc[i].genres[j]]);
					}
					userList.push(user);
		    	}
    			res.status(200).json(userList);
	    	});
    	});

    });
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
    let result;
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
    let result;
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
					doc.hasFinishedSetup = true;
		      	}
		      	doc.save();
		      	res.status(201).send("{}");
	      	}
	    });
  	});
  });

  function validateSetupSelection(req, res, ids) {
		let result;
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
	    const imgFolder = "img/";

	    if (!fs.existsSync(imgFolder)){
    		fs.mkdirSync(imgFolder);
		}

	    if (!req.files) {
	        result = {err:6, msg:"No files uploaded."};
	  		res.status(412).send(result);
	        return;
	    }

	    if (Object.keys(req.files).length > 1) {
			result = {err:5, msg:"Only upload one image at a time."};
	  		res.status(412).send(result);
	  		return;
	    }

	 	const supportedFileTypes = ["image/jpeg", "image/png", "application/octet-stream"];

		const sampleFile = req.files[Object.keys(req.files)[0]];
		if (supportedFileTypes.indexOf(sampleFile.mimetype.toString()) === -1) {
			result = {err:10, msg:"File type not supported"};
	  		res.status(415).send(result);
	  		return;
		}

		let extension;

		if (sampleFile.mimetype === "application/octet-stream") {
			if (!req.body.filename) throw "No filename in body";

			let list = req.body.filename.split(".");
			if (list.length === 0) {
				result = {err:8, msg:"Incorrect file name"};
	  			res.status(412).send(result);
	  			return;
			} else {
				extension = list[list.length-1];
			}
		} else {
			extension = sampleFile.mimetype.split("/")[1];
		}

		const imgPath = imgFolder + req.user._id + "." + extension;

	    sampleFile.mv(imgPath, function(err) {
	        if (err) {
	            console.log("ERR");
	            res.status(500).send(err);

	        } else {

	        	user.findOne({_id:req.user._id}, function(err, doc) {
				  	if (err) throw "err";
				  	if (doc.image.public_id) {
					  	cloudinary.api.delete_resources([doc.image.public_id], (deleteResult) => {
					  	}, {invalidate:true});
				  	}
				  	cloudinary.uploader.upload(imgPath, function(result) {
						  	let imageObject = {url:result.secure_url, public_id:result.public_id};
					  		doc.image = imageObject;
					  		doc.save();
							res.status(201).json({'url': result.secure_url}).send();
						}, { width: 512, height: 512, gravity: "face", crop: "fill"});
				});
	        }
	    });
	});

  app.get('/chat_history', (req, res) => {
    let result;
    user.findOne({_id:req.chatSchema}, function(err, doc) {
      if (err) {
	        console.log("Error occurred:");
	        console.log(err);
          result = {err: 5, msg: "Unknown internal server error occurred."};
          res.status(500).send(result);
          return;
        }
  	});
  });
};
