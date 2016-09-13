const dbURI = 'mongodb://localhost/test';
var assert = require('assert');
const should = require('should');
const mongoose = require('mongoose');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
process.env.NODE_ENV = 'test';

const app = require('../index');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('signup routes', function () {

  // this runs before tests
  before((done) => {
    //clearDB((err) => {
      //if(err) throw err;
    //});
    if(mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);

  });


  after(() => {
  });

  describe('#local-users', () => {
    it('should return 201 on new user', function (done) {
      let user = {
        username: "newTest",
        password: "SuperSecurePassword"
      };

      request(app)
        .post('/signup-local')
        .send(user)
        .end((err, res) => {
          if(err) throw err;

          res.status.should.be.equal(201);
          done();
        });
    });

    it('should return 401 on trying to use duplicate usernames', function () {
      let user = {
        username: "testPerson",
        password: "wowSuchSecret"
      };
      request(app)
        .post('/signup-local')
        .send(user)
        .end((err, res) => {
          if(err) throw err;

          request(url)
            .post('/signup-local')
            .send(user)
            .end((err, res) => {
              if(err) throw err;

              res.should.have.status(401);
              done();
            });
        });

    });
  });
});
