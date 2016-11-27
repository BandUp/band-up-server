const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
const user = require('../models/user');

module.exports = function(app) {

    describe('User like', function() {
        describe('#like', function() {
            beforeEach((done) => {
                // create test user
                let newUser = new user();
                newUser.username = "TestPerson";
                newUser.local.password = newUser.generateHash("SecretTestPassword");
                newUser.email = 'test@gmail.com';
                newUser.dateOfBirth = "Sun Nov 18 1990 15:20:58 GMT+0000 (Greenwich Standard Time)";
                newUser.save((err) => {
                    if (err) throw err;
                    done();
                });
            });

            /*
             * Author: Elvar
             * Signees:
             */
            it('user1 should like user2', function(done) {
                let agent = request.agent(app);
                agent
                    .post('/login-local')
                    .send({
                        username: 'TestPerson',
                        password: 'SecretTestPassword'
                    }).end((err, res) => {
                        if (err) throw err;
                        /* Work in progress */
                        done();
                    });
            });
        });
    });
};
