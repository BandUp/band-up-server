const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
const user = require('../models/user');

module.exports = function(app) {

    describe('User liking another user', function() {
        describe('#like', function() {
            beforeEach((done) => {
                // create test user
                let newUser1 = new user();
                newUser1.username = "TestPerson1";
                newUser1.local.password = newUser.generateHash("SecretTestPassword");
                newUser1.email = 'test1@gmail.com';
                newUser1.dateOfBirth = "Sun Nov 18 1990 15:20:58 GMT+0000 (Greenwich Standard Time)";
                newUser1.save((err) => {
                    if (err) throw err;
                });

                let newUser2 = new user();
                newUser2.username = "TestPerson2";
                newUser2.local.password = newUser.generateHash("SecretTestPassword");
                newUser2.email = 'test2@gmail.com';
                newUser2.dateOfBirth = "Sun Nov 18 1990 15:20:58 GMT+0000 (Greenwich Standard Time)";
                newUser2.save((err) => {
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
                        username: 'TestPerson1',
                        password: 'SecretTestPassword'
                    }).end((err, res) => {
                      /* Work in progress.. */
                    });
            });
        });
    });
};
