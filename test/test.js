const assert = require('assert');
process.env.NODE_ENV = 'test';

const app = require('../index');
require('dotenv').config();
require('./local-passport-test')(app);

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
