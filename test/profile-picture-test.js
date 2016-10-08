const dbURI = process.env.MONGO_TEST;
const mongoose = require('mongoose');
const assert = require('assert');
const should = require('should');
const request = require('supertest');
const clearDB = require('mocha-mongoose')(dbURI);
const user = require('../models/user');

module.exports = function(app) {
	describe('Upload Profile Picture', function () {
	    // this runs before tests
	    before((done) => {
	      if(mongoose.connection.db) return done();
	      mongoose.connect(dbURI, done);
	    });

    	beforeEach((done) => {
    		// create test user
	    	let newUser = new user();
	        newUser.username = "TestPerson";
	        newUser.local.password = newUser.generateHash("SecretTestPassword");
	        newUser.email = 'test@gmail.com';
	        newUser.local.age = 25;
	        newUser.save((err) => {
	        	if(err) throw err;
	        	done();
	      	});
	    });

	    // clean out database before every test
	    afterEach(function(done) {
	      clearDB((err) => {
	        if(err) throw err;
	        done();
	      });
	    });

		/*
		* Author: Bergþór
		* Signees:
		*/
		it('should fail when no files are attached', function(done) {
			let agent = request.agent(app);
			agent
				.post('/login-local')
				.send({
					username: 'TestPerson',
					password: 'SecretTestPassword'
				}).end((err, res) => {
					agent
						.post('/profile-picture')
						.expect(412)
						.end((err, res2) => {
							if (err) throw err;
							res2.body.err.should.equal(6);
							done();
						});
				});
		});

		/*
		* Author: Bergþór
		* Signees:
		*/
		it('should fail when uploading more than one image', function(done) {
			let agent = request.agent(app);
			agent
				.post('/login-local')
				.send({
					username: 'TestPerson',
					password: 'SecretTestPassword'
				}).end((err, res) => {
					agent
						.post('/profile-picture')
						.type("multipart/form-data")
						.attach('image1', 'test/shadowface.jpg')
						.attach('image2', 'test/shadowface.jpg')
						.expect(412)
						.end((err, res2) => {
							if (err) throw err;
							res2.body.err.should.equal(5);
							done();
						});
				});
		});

		/*
		* Author: Bergþór
		* Signees:
		*/
		it('should fail when uploading a text file', function(done) {
			let agent = request.agent(app);
			agent
				.post('/login-local')
				.send({
					username: 'TestPerson',
					password: 'SecretTestPassword'
				}).end((err, res) => {
					agent
						.post('/profile-picture')
						.type("multipart/form-data")
						.attach('file1', 'test/test.js')
						.expect(412)
						.end((err, res2) => {
							if (err) throw err;
							res2.body.err.should.equal(10);
							done();
						});
				});
		});
	});
};
