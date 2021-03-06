const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
const user = require('../models/user');
const instrument = require('../models/instrument');
const genre = require('../models/genre');

module.exports = function(app) {

	describe('user handling', function() {
		let _id = 0;
		describe('#editing', function() {
			beforeEach((done) => {
				// create test user
				let newUser = new user();
				newUser.username = "TestPerson";
				newUser.local.password = newUser.generateHash("SecretTestPassword");
				newUser.email = 'test@gmail.com';
				newUser.local.age = 25;
				newUser.save((err) => {
					if (err) throw err;
					_id = newUser._id;
					done();
				});
			});

			/*
			 * Author: Dagur
			 * Signees: Elvar
			 * Edited by: Bergþór
			 */
			it('getUser should return a user DTO', function(done) {
				let user = request.agent(app);
				user
					.post("/login-local")
					.send({
						username: "test@gmail.com",
						password: "SecretTestPassword"
					}).end((err, res) => {
						user
							.get('/user')
							.send({
								userId: _id
							})
							.end((err, res) => {
								if (err) throw err;
								res.body.should.have.property("username").which.is.not.null();
								res.body.should.have.property("aboutme").which.is.not.null();
								done();
							});
					});
			});

			/*
			 * Author: Dagur
			 * Signees: Elvar
			 */
			it('should add text in about me', function(done) {
				let user = request.agent(app);

				user
					.post('/login-local')
					.send({
						username: "test@gmail.com",
						password: "SecretTestPassword"
					}).end((err, res) => {
						user.post('/edit-user')
							.send({
								aboutme: "trololol"
							})
							.end((err, res) => {
								res.body.aboutme.should.be.equal("trololol");
								user
									.get('/user')
									.send({
										userId: _id
									})
									.end((err, res) => {
										res.body.should.have.property("aboutme").which.is.equal("trololol");
										done();
									});
							}).expect(200);
					});
			});
		});
	});
};
