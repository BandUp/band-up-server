const user = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');
const chatHistory = require('../models/chatHistory');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const cloudinary = require('cloudinary');
const geolib = require('geolib');
const nudity = require('nudity-filter');
// Functions that are shared between route files.
const shared = require('./shared');

module.exports = function(app, passport) {

    require('./login-signup')(app, passport);
    require('./like-match-routes')(app, passport);
    require('./user-routes')(app, passport);

    app.post('/login-local/location', isLoggedIn, (req, res) => {
        if (!req.body.location) {
            throw "need location info in body";
        }
        let currUser = req.user;
        console.log(req.body);
        currUser.location.lat = req.body.location.lat;
        currUser.location.lon = req.body.location.lon;

        if (currUser.location.lat === 0 && currUser.location.lon === 0) {
        	currUser.location.valid = false;
        } else {
        	currUser.location.valid = true;
        }

        currUser.save((err) => {
            if (err) throw err;
            res.status(200).send({});
        });
    });

    /**
     * a searchpath taking in a mongodb search object
     * as req.body
     * only searches in the users collection
     */
    app.get('/search', isLoggedIn, (req, res) => {
        user.find(req.body, (err, doc) => {
            if(err) throw err;
            res.json(doc).status(200);
        });
    });


    /**
     * index function also used to quickly test various featuress
     */
    app.get('/', (req, res) => {
        if (req.user) {
            console.log(req.user.gcmToken);
            app.gcmSender.sendTestMessage([req.user.gcmToken]);
        }
        res.send('Hello world!');
    });

    /**
    * get x many user nearby that are not already liked
    */
    app.get('/nearby-users', isLoggedIn, (req, res) => {
        user.find({
            '_id': {
                $ne: req.user._id,
                $nin: req.user.liked
            },
            hasFinishedSetup: true
        }, function(err, userDoc) {
            if (err) {
                console.log("Error occurred:");
                console.log(err);
                res.status(500).send("Unknown internal server error occurred.");
                return;
            }
            let userList = [];
            shared.itemNamesToMap(instrument, (instruMap) => {
                shared.itemNamesToMap(genre, (genresMap) => {
                    if (!instruMap || !genresMap) {
                        res.status(500).send("Unknown internal server error occurred.");
                        return;
                    }

                    for (let i = 0; i < userDoc.length; i++) {
                        userList.push(shared.userToDTO(req.user, userDoc[i], instruMap, genresMap));
                    }
                    res.status(200).send(userList);
                });
            });

        });
    });

    app.get('/chat_history/:id', isLoggedIn, (req, res) => {

        var userList = [req.user._id, req.params.id].sort();

        chatHistory.findOne({
            "users": userList
        }, function(err, doc) {
            if (err) {
                console.log("Error occurred:");
                console.log(err);
                res.status(500).send("Unknown internal server error occurred.");
                return;
            }
            if (!doc) {
                res.status(404).send();
                return;
            }

            res.status(200).send(doc);
        });
    });

    // route middleware to make sure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
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
        }).sort({
            order: 'ascending'
        });
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
        }).sort({
            order: 'ascending'
        });
    });

    app.post('/instruments', isLoggedIn, (req, res) => {
        let result;
        user.findOne({
            _id: req.user._id
        }, function(err, doc) {
            if (err) {
                console.log("Error occurred:");
                console.log(err);
                result = {
                    err: 5,
                    msg: "Unknown internal server error occurred."
                };
                res.status(500).send(result);
                return;
            }

            if (!doc) {
                result = {
                    err: 4,
                    msg: "Unknown internal server error occurred."
                };
                res.status(500).send(result);
            }

            instrument.find({}, function(err, instruDoc) {
                if (err) {
                    console.log("Error occurred:");
                    console.log(err);
                    res.status(500).send("Unknown internal server error occurred.");
                    return;
                }
                result = instruDoc.map(function(a) {
                    return a._id.toString();
                });
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
        user.findOne({
            _id: req.user._id
        }, function(err, doc) {
            if (err) {
                console.log("Error occurred:");
                console.log(err);
                result = {
                    err: 5,
                    msg: "Unknown internal server error occurred."
                };
                res.status(500).send(result);
                return;
            }

            if (!doc) {
                result = {
                    err: 4,
                    msg: "Unknown internal server error occurred."
                };
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
                result = genreDoc.map(function(a) {
                    return a._id.toString();
                });
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
                result = {
                    err: 4,
                    msg: "Invalid ID"
                };
                res.status(412).send(result);
                return false;
            }
        }

        if (!req) {
            result = {
                err: 0,
                msg: "Precondition Failed"
            };
            res.status(412).send(result);
            return false;
        }
        if (!req.body) {
            result = {
                err: 1,
                msg: "The body is empty"
            };
            res.status(412).send(result);
            return false;
        }

        if (!Array.isArray(req.body)) {
            result = {
                err: 2,
                msg: "Needs to be an array"
            };
            res.status(412).send(result);
            return false;
        }

        if (req.body.length === 0) {
            result = {
                err: 3,
                msg: "You need to select at least one item"
            };
            res.status(412).send(result);
            return false;
        }
        return true;
    }

    app.post('/profile-picture', isLoggedIn, function(req, res) {
        const imgFolder = "img/";

        if (!fs.existsSync(imgFolder)) {
            fs.mkdirSync(imgFolder);
        }

        if (!req.files) {
            result = {
                err: 6,
                msg: "No files uploaded."
            };
            res.status(412).send(result);
            return;
        }

        if (Object.keys(req.files).length > 1) {
            result = {
                err: 5,
                msg: "Only upload one image at a time."
            };
            res.status(412).send(result);
            return;
        }

        const supportedFileTypes = ["image/jpeg", "image/png", "application/octet-stream"];

        const sampleFile = req.files[Object.keys(req.files)[0]];
        if (supportedFileTypes.indexOf(sampleFile.mimetype.toString()) === -1) {
            result = {
                err: 10,
                msg: "File type not supported"
            };
            res.status(415).send(result);
            return;
        }

        let extension;

        if (sampleFile.mimetype === "application/octet-stream") {
            if (!req.body.filename) throw "No filename in body";

            let list = req.body.filename.split(".");
            if (list.length === 0) {
                result = {
                    err: 8,
                    msg: "Incorrect file name"
                };
                res.status(412).send(result);
                return;
            } else {
                extension = list[list.length - 1];
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
                checkNudity(imgPath, (nude) => {
                    if (nude) {
                        res.status(406).send({err: 11, msg: "nudity detected"});
                    }else{
                        user.findOne({
                            _id: req.user._id
                        }, function(err, doc) {
                            if (err) throw "err";
                            if (doc.image.public_id) {
                                cloudinary.api.delete_resources([doc.image.public_id], (deleteResult) => {}, {
                                    invalidate: true
                                });
                            }
                            cloudinary.uploader.upload(imgPath, function(result) {
                                let imageObject = {
                                    url: result.secure_url,
                                    public_id: result.public_id
                                };
                                doc.image = imageObject;
                                doc.save();
                                res.status(201).json({
                                    'url': result.secure_url
                                }).send();
                            }, {
                                width: 1024,
                                height: 1024,
                                gravity: "face",
                                crop: "fill"
                            });
                        });
                    }
                });
            }
        });
    });
    function checkNudity(path, done) {
        try{
            let API_USER = process.env.SIGHTENGINE_USER;
            let API_SECRET = process.env.SIGHTENGINE_SECRET;
            let sightEngine = new nudity(API_USER, API_SECRET);

            sightEngine.checkNudityForFile(path, (err, result) => {
                if (err) console.log(err);
                if (result.safe > 0.5) {
                    done(false);
                }else{
                    done(true);
                }
            });
        }catch(err){
            console.log(err.message);
            done(false);
        }

    }
};
