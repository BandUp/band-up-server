const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
const user = require('../models/user');

let user1;
let user2;

module.exports = function(app) {
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
					user1 = newUser;
					let newUser2 = new user();
					newUser2.username = "TestPerson2";
					newUser2.local.password = newUser2.generateHash("SecretTestPassword2");
					newUser2.email = "test@test.is";
					newUser2.dateOfBirth = "Sun Nov 18 1990 15:20:58 GMT+0000 (Greenwich Standard Time)";
					newUser2.save((err) => {
						user2 = newUser2;
						done();
					});
				});
			});

			/*
			 * Author: Elvar
			 * Signees:
			 */
			it('user1 should be able to like like user2', function(done) {
				let agent = request.agent(app);
				agent
					.post('/login-local')
					.send({
						username: 'TestPerson',
						password: 'SecretTestPassword'
					}).end((err, res) => {
						if (err) throw err;
						agent
							.post('/like')
							.send({
								userID: user2._id
							}).end((err, res) => {
								if (err) throw err;
								user.findById(user1._id, (err, doc) => {
									if (err) throw err;
									doc.liked.should.containEql(user2._id.toString());
									res.body.isMatch.should.be.false();
									done();
								});
							});
					});
			});

			/*
			 * Author: Elvar
			 * Signees:
			 */
			it('user1 should match user2', function(done) {
				let agent1 = request.agent(app);
				let agent2 = request.agent(app);
				agent1
					.post('/login-local')
					.send({
						username: 'TestPerson',
						password: 'SecretTestPassword'
					}).end((err, res) => {
						if (err) throw err;
						agent1
							.post('/like')
							.send({
								userID: user2._id
							}).end((err, res) => {
								if (err) throw err;
								agent2
									.post('/login-local')
									.send({
										username: 'TestPerson2',
										password: 'SecretTestPassword2'
									}).end((err, res) => {
										if (err) throw err;
										agent2
											.post('/like')
											.send({
												userID: user1._id
											}).end((err, res) => {
												if (err) throw err;
												user.findById(user1._id, (err, doc1) => {
													user.findById(user2._id, (err, doc2) => {
														doc1.liked.should.containEql(user2._id.toString());
														doc2.liked.should.containEql(user1._id.toString());
														doc1.matched.should.containEql(user2._id.toString());
														doc2.matched.should.containEql(user1._id.toString());
														res.body.isMatch.should.be.true();
														done();
													});
												});
											});
									});
							});
					});
			});
		});
	});
};
