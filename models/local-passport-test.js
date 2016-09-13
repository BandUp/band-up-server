const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);

module.exports = function(app){
  describe('signup routes', function () {

    // this runs before tests
    before((done) => {
      if(mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
    });

    before(function(done) {
      clearDB((err) => {
        if(err) throw err;
        done();
      });
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

      it('should return 401 on trying to use duplicate usernames', function (done) {
        let user = {
          username: "testPerson",
          password: "wowSuchSecret"
        };
        request(app)
          .post('/signup-local')
          .send(user)
          .end((err, res) => {
            if(err) throw err;

            request(app)
              .post('/signup-local')
              .send(user)
              .end((err, res) => {
                if(err) throw err;

                res.status.should.be.equal(401);
                done();
              });
          });

      });
    });
  });

};
