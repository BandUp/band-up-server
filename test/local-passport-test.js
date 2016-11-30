const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
const user = require('../models/user');

module.exports = function(app) {

	describe('LocalStrategy', function() {
		// this runs before tests
		before((done) => {
			if (mongoose.connection.db) return done();
			mongoose.connect(dbURI, done);
		});

		// clean out database before every test
		beforeEach(function(done) {
			clearDB((err) => {
				if (err) throw err;
				done();
			});
		});

		after(() => {});

		describe('#local-login', () => {
			// create test user
			beforeEach((done) => {
				let newUser = new user();
				newUser.username = "TestPerson";
				newUser.local.password = newUser.generateHash("SecretTestPassword");
				newUser.email = 'woo@mail.com';
				newUser.dateOfBirth = "Sun Nov 18 1990 15:20:58 GMT+0000 (Greenwich Standard Time)";
				newUser.save((err) => {
					if (err) throw err;
					done();
				});
			});

			/*
			 * Author: Dagur
			 * Signees: Elvar
			 */
			it('should return 200 on successful login', function(done) {
				request(app) // make a request to app
					.post('/login-local') // this path
					.send({ // send this object
						username: 'woo@mail.com',
						password: 'SecretTestPassword'
					}).end((err, res) => { // callback with results
						if (err) throw err;
						res.status.should.be.equal(200);
						done();
					});
			});

			/*
			 * Author: Dagur
			 * Signees: Elvar
			 */
			it('should return token on succesful login', function(done) {
				request(app)
					.post('/login-local')
					.send({
						username: 'woo@mail.com',
						password: 'SecretTestPassword'
					}).end((err, res) => {
						if (err) throw err;
						res.body.should.have.property('sessionID').which.is.a.String();
						done();
					});
			});

			/*
			 * Author: Dagur
			 * Signees: Elvar
			 */
			it('should return 401 on unsuccesful login', function(done) {
				request(app)
					.post('/login-local')
					.send({
						username: 'woo@mail.com',
						password: 'WrongSecretTestPassword'
					}).end((err, res) => {
						if (err) throw err;
						res.status.should.be.equal(401);
						done();
					});
			});
		});

		describe('#local-signup', () => {
			it('should return 201 on new user', function(done) {
				let user = {
					username: "newTest",
					password: "SuperSecurePassword",
					email: "example@example.com"
				};

				request(app)
					.post('/signup-local')
					.send(user)
					.end((err, res) => {
						if (err) throw err;
						res.status.should.be.equal(201);
						done();
					});
			});

			/*
			 * Author: Dagur
			 * Signees: Elvar
			 */
			it('should return 401 on trying to use duplicate usernames', function(done) {
				let user = {
					username: "testPerson",
					password: "wowSuchSecret",
					email: "example@example.com"
				};
				request(app)
					.post('/signup-local')
					.send(user)
					.end((err, res) => {
						if (err) throw err;

						request(app)
							.post('/signup-local')
							.send(user)
							.end((err, res) => {
								if (err) throw err;

								res.status.should.be.equal(401);
								done();
							});
					});
			});
		});
	});
};
