const User = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');

module.exports = function(app, passport){
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

  app.get('/matches', isLoggedIn, (req, res) =>{
    User.find({'_id': req.user.matches}, (err, doc) =>{
      if(err){
        res.sendStatus(500);
      }
      res.json(doc).sendStatus(200);
    });
  });

  // takes in a user object and modifies current user
  app.post('/edit-user', isLoggedIn, (req, res) => {
    let editedUser = req.body.user;
    let origUser = req.user;
    if(editedUser._id !== origUser._id){
      res.status(402);
      return;
    }

    for(let attrName in editedUser){
      if(editedUser[attrName] !== origUser[attrName]){
        origUser[attrName] = editedUser[attrName];
      }
    }

    origUser.save((err) =>{
      if(err) throw err;
      res.json(origUser).sendStatus(200);
    });
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
