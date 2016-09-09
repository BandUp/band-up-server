module.exports = function(app, passport){
  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.post('/signup-local', passport.authenticate('local-signup'), (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    // Rafá was here ;p
    //res.status(201).json({id: req.user._id}).send();
    res.status(201).json({"success"}).send();
  });

  app.get('/nearby-users', (req, res) => {
      res.json([
        {name: 'Bergþór'},
        {name: 'Dagur'},
        {name: 'Elvar'},
        {name: 'Rafael'}
      ]);
  });

  app.post('/login-local', passport.authenticate('local-login', {
    failureFlash: true
  }), (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    res.status(200).json({sessionID: req.sessionID}).send();
  });
};
