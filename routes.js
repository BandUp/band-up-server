module.exports = function(app, passport){
  app.get('/', (req, res) => {
    res.send('Hello world!');
  });

  app.post('/signup-local', passport.authenticate('local-signup', {
    successRedirect: '/nearby-users',
    failureRedirect: '/signup-fail',
    failureFlash: true
  }));

  app.post('/nearby-users', (req, res) => {
      res.json([
        {name: 'Bergþór'},
        {name: 'Dagur'},
        {name: 'Elvar'},
        {name: 'Rafael'}
      ]);
  });
};
