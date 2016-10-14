const User = require('../models/user');

module.exports = function(app, passport){
  app.post('/like', isLoggedIn, (req, res) => {
    let user = req.user;
    if (user.liked.indexOf(req.body.userID) === -1) {

      User.findById(user._id, (err, currUserDoc) => {
        
        if (!req.body.userID) {
          res.status(412).send({err:1, msg:"Need the user ID that was liked."});
          return;
        }

        // new like
        currUserDoc.liked.push(req.body.userID);

        // chech matched
        User.findById(req.body.userID, (err, doc) => {
          let isMatch = false;
          if(err) throw err;
          if(doc && doc.liked.indexOf(user._id) !== -1){
            isMatch = true;
            currUserDoc.matched.push(doc._id);
            currUserDoc.save((err) => {
              if(err) throw err;
            });
            doc.matched.push(user._id);
            doc.save((err) => {
              if(err) throw err;
            });

          }
          res.json({'isMatch': isMatch});
        });

        currUserDoc.save((err) => {
          if (err) throw err;
        });
      });
      
    } else {
      // already liked let's unlike
      // TODO: check for matches and remove if needed
      user.liked = user.liked.filter((item) => {return (item !== req.body.userID);});
      user.save((err) => {
        if (err) throw err;
        res.json({'isMatch': false});
      });
    }
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
