const User = require('../models/user');
const guid = require("node-uuid");

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
        // send validation e-mail
		//app.Mailer.sendValidationEmail(req.user);
        res.status(201).json({
            id: req.user._id
        }).send();
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
        res.status(200).send("{}");
    });

    app.get('/isLoggedIn', (req, res) => {
        if (!req.user) {
            res.json({
                isLoggedIn: false,
                hasFinishedSetup: false
            });
        } else {
            res.json({
                isLoggedIn: req.isAuthenticated(),
                hasFinishedSetup: req.user.hasFinishedSetup
            });
        }
    });

    app.post('/login-facebook',
        passport.authenticate('facebook-token'),
        (req, res) => {
            res.json({
                sessionID: req.sessionID,
                userID: req.user._id,
                hasFinishedSetup: req.user.hasFinishedSetup,
            });
        });

    app.post('/login-google',
        passport.authenticate('google-id-token'),
        (req, res) => {
            res.json({
                sessionID: req.sessionID,
                userID: req.user._id,
                hasFinishedSetup: req.user.hasFinishedSetup
            });
        });

    app.get('/login-soundcloud',
        passport.authenticate('soundcloud-token'),
        (req, res) => {
            req.user.email = req.body.email;
            console.log(req);
            res.json({
                sessionID: req.sessionID,
                userID: req.user._id,
                hasFinishedSetup: req.user.hasFinishedSetup,
            });
        });
    app.post('/email', (req, res) => {
        if (!req.body.email) {
            res.status(412).send("{}");
            return;
        }

        User.findOne({
            'email': req.body.email
        }, (err, user) => {
            if (err) {
                console.log(err.message);
                res.status(500).send("{}");
                return;
            }

            if (user) {
                res.json({
                    emailInUse: true
                });
            } else {
                res.json({
                    emailInUse: false
                });
            }
        });
    });

    /**
     * send an email to user with coresponding email address
     * to allow him to reset his/her password
     */
	app.post('/reset-password', (req, res) =>{
		User.findOne({email: req.body.email}, (err, doc) =>{
			if(err) throw err;
			doc.resetToken = uuid.v4();
			app.mailer.sendPaswordReset(doc);
			setTimeOut(() => {
				doc.resetToken = "";
			}, 86400000); // wait for 24 hours
			res.json({succesfull: true}).status(200);
		});
	});

    /**
     * create webpage to allow the user to reset his/her password
     */
	app.get('/reset-password/:token', (req, res) =>{
		User.findOne({resetToken: req.params.token}, (err, doc) =>{
			// todo: render html to allow user to create new password
		});
	});

    /**
     * resets the password of user with the corresponding resetToken
     * to the password provided in req.body.password
     */
	app.post('/reset-password/:token', (req, res) =>{
		User.findOne({resetToken: req.params.token}, (err, doc) =>{
			doc.local.password = doc.generateHash(req.body.password);
			doc.resetToken = "";
			doc.save((err) =>{
				if (err) throw err;
				// todo: send a nice html page
				res.status(200);
			});
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
