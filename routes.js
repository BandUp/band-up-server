module.exports = function(app, passport){
  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.post('/signup-local', passport.authenticate('local-signup'), (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    res.status(201).send(req.user._id);
  });

  app.get('/nearby-users', (req, res) => {
      res.json([
        {name: 'Bergþór'},
        {name: 'Dagur'},
        {name: 'Elvar'},
        {name: 'Rafael'}
      ]);
  });

  app.post('/login-local', passport.authenticate('local-login'), (req, res) => {
    // this function only gets called when signup was succesful
    // req.user contains authenticated user.
    res.status(200).send(req.user);
  });
};
