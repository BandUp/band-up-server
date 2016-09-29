const dbURI 		= process.env.MONGO_TEST;
const mongoose 		= require('mongoose');
const assert	 	= require('assert');
const should 		= require('should');
const request 		= require('supertest');
const clearDB 		= require('mocha-mongoose')(dbURI);
const user 			= require('../models/user');
const instrument 	= require('../models/instrument');
const genre 	= require('../models/genre');

module.exports = function(app) {
	const instruments = [
		'Guitar',
		'Drums',
		'Vocals',
		'Percussion',
		'Bass',
		'Wind',
		'Strings',
		'Harmonica',
		'Piano',
		'Keyboard'
	];

	const genres = [
		'Rock',
		'RnB',
		'Pop',
		'Blues',
		'Country',
		'Electronic',
		'Folk',
		'Hip Hop',
		'Jazz',
		'World'
	];

	describe('Instruments and Genres', function () {
    // this runs before tests
    before((done) => {
      if(mongoose.connection.db) return done();
      mongoose.connect(dbURI, done);
    });

    // clean out database before every test
    afterEach(function(done) {
      clearDB((err) => {
        if(err) throw err;
        done();
      });
    });

    after(() => {
    });

    describe('#getters', () => {
	    // create test user
	    beforeEach((done) => {
	    	let newUser = new user();
	        newUser.local.username = "TestPerson";
	        newUser.local.password = newUser.generateHash("SecretTestPassword");
	        newUser.local.email = 'test@gmail.com';
	        newUser.local.age = 25;
	        newUser.save((err) => {
	        	if(err) throw err;
	        	done();
	      });
	    });

	    beforeEach((done) => {
	    	for (var i = 0; i < instruments.length; i++) {
	    		let ins = new instrument();
	    		ins.order = i;
	    		ins.name = instruments[i];
	    		ins.save((err) => {
	    			if (err) throw err;
	    		});
	    	}

	    	for (var i = 0; i < genres.length; i++) {
	    		let gen = new genre();
	    		gen.order = i;
	    		gen.name = genres[i];
	    		gen.save((err) => {
	    			if (err) throw err;
	    		});
	    	}
	    	done();
    	});


		/*
		* Author: Elvar
		* Signees: Dagur
		*/
		it('should get instruments', function(done) {
			let agent = request.agent(app);
			agent
				.post('/login-local')
				.send({ 
					username: 'TestPerson', 
					password: 'SecretTestPassword'
				}).end((err, res) => {
					agent
						.get('/instruments')
						.expect(200)
						.end((err, res) => {
							if (err) throw err;
							for (var i = 0; i < res.body.length; i++) {
								res.body[i].should.have.property('order').which.is.equal(i);
								res.body[i].should.have.property('name').which.is.equal(instruments[i]);
							}
							done();
						});
				})
		});

		/*
		* Author: Elvar
		* Signees: Dagur
		*/
		it('should get genres', function(done) {
			let agent = request.agent(app);
			agent
				.post('/login-local')
				.send({ 
					username: 'TestPerson', 
					password: 'SecretTestPassword'
				}).end((err, res) => {
					agent
						.get('/genres')
						.expect(200)
						.end((err, res) => {
							if (err) throw err;
							for (var i = 0; i < res.body.length; i++) {
								res.body[i].should.have.property('order').which.is.equal(i);
								res.body[i].should.have.property('name').which.is.equal(genres[i]);
							}
							done();
						});
				})
		});

	});
  });
};