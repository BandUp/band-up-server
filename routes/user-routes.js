const User = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');
const shared = require('./shared');

module.exports = function(app, passport) {

    // returns user all data to client
    app.all('/user', isLoggedIn, (req, res) => {
        User.findById(req.body.userId, (err, userDoc) => {
            if (err || !userDoc) {
                res.status(500).send();
                console.log("error");
            } else if (userDoc) {
                let userList = [];
                shared.itemNamesToMap(instrument, (instruMap) => {
                    shared.itemNamesToMap(genre, (genresMap) => {
                        if (!instruMap || !genresMap) {
                            res.status(500).send("Unknown internal server error occurred.");
                            return;
                        }
                        let dto = shared.userToDTO(req.user, userDoc, instruMap, genresMap);
                        res.status(200).send(dto);
                    });
                });
            }
        });
    });

    app.get('/isLoggedIn', (req, res) => {
        res.json({
            isLoggedIn: req.user.isAuthenticated(),
            hasFinishedSetup: req.user.hasFinishedSetup
        });
    });

    app.get('/matches', isLoggedIn, (req, res) => {
        console.log(req.user.matched);
        User.find({
            '_id': {
                $in: req.user.matched
            }
        }, (err, doc) => {
            if (err) {
                res.sendStatus(500);
                return;
            }

            res.status(200).send(doc);
        });
    });

    /*
      app.all('/edit-user', (req, res) => {
    	  console.log("ID is: " + req.body.userId);
    	  console.log("about user is: " + req.body.aboutMe);
    	  User.findById(req.body.userId, (err, doc) => {
    	  if(err || !doc) {
    		  res.status(500).send();
    			console.log("Error edit-user path");
    	  }
    	  else if (req.body.aboutMe) {
    		  doc.aboutme = req.body.aboutMe;
    		  doc.save();
    		  res.status(200).send({});   // sending empty JSONObject response to satysfy response
    	  }
    	  // add another update ex. else if (req.body.instr) {doc.instruments = req.body.instr}
    	  });
      });
      */
    app.all('/get-instrument', (req, res) => {
        console.log(req.body.id);
        instrument.findById(req.body.id, (err, doc) => {
            if (err) {
                res.sendStatus(500);
                return;
            } else {
                res.status(200).send(doc);
            }
        });
    });


    // takes in a user object and modifies current user
    app.all('/edit-user', isLoggedIn, (req, res) => {
        //console.log("ID is: " + req.body.userId);
        //console.log("about user is: " + req.body.aboutMe);
        let editedUser = req.body;
        let origUser = req.user;

        for (let attrName of Object.keys(editedUser)) {
            if (editedUser[attrName] != origUser[attrName]) {
                origUser[attrName] = editedUser[attrName];
            }
        }

        origUser.save((err) => {
            if (err) throw err;
            res.json(origUser).status(200).send();
        });
    });

    app.post('/gcmRegToken', isLoggedIn, (req, res) => {
        req.user.gcmToken = req.body.regToken;

        req.user.save((err) => {
            res.status(200).send();
        });

    });

};

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // user is not authorized send 401 back
    res.status(401).send("You are not authorized to access this data.");
}
