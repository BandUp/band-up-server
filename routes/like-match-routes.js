const User = require('../models/user');

module.exports = function(app, passport){
  app.post('/like', isLoggedIn, (res, req) => {
    let user = req.user;
    if(user.liked.indexOf(req.body.userID) === -1){
      // new like
      user.liked.push(req.body.userID);
      // chech matched
      User.findById(req.body.userID, (err, doc) => {
        let isMatch = false;
        if(err) throw err;
        if(doc && doc.liked.indexOf(user._id) === -1){
          isMatch = true;
          user.matched.push(doc._id);
          user.save((err) => {
            if(err) throw err;
          });
          doc.matched.push(user._id);
          doc.save((err) => {
            if(err) throw err;
          });
        }
        res.json({'isMatch': isMatch}).sendStatus(200);
      });
    } else {
      // already liked let's unlike
      // TODO: check for matches and remove if needed
      user.liked = user.liked.filter((item) => {return (item !== req.body.userID);});
      user.save((err) => {
        if (err) throw err;
        res.json({'isMatch': false}).sendStatus(200);
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
