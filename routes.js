module.exports = function(app, passport){
  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.post('/signup-local', passport.authenticate('local-signup', {
    failureFlash: true
  }));

  app.get('/nearby-users', (req, res) => {
      res.json([
        {name: 'Bergþór'},
        {name: 'Dagur'},
        {name: 'Elvar'},
        {name: 'Rafael'}
      ]);
  });

  app.post('/login-local', passport.authenticate('local-login', {
    successRedirect: '/nearby-users',
    failureRedirect: '/login-local',
    failureFlash: true
  }));
};
