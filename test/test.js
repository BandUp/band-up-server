const assert = require('assert');
process.env.NODE_ENV = 'test';

const app = require('../index');
require('./local-passport-test')(app);
require('./routes-test')(app);
require('./profile-picture-test')(app);
require('./user-routes-test')(app);
