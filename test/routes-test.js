const dbURI 		= process.env.MONGO_TEST;
const mongoose 		= require('mongoose');
const assert	 	= require('assert');
const should 		= require('should');
const request 		= require('supertest');
const clearDB 		= require('mocha-mongoose')(dbURI);
const user 			= require('../models/user');
const instrument 	= require('../models/instrument');
const genre 		= require('../models/genre');

module.exports = function(app) {
	const instruments = [
		{_id: "0", order: 0, name: 'Guitar'},
		{_id: "1", order: 1, name: 'Drums'},
		{_id: "2", order: 2, name: 'Vocals'},
		{_id: "3", order: 3, name: 'Percussion'},
		{_id: "4", order: 4, name: 'Bass'},
		{_id: "5", order: 5, name: 'Wind'},
		{_id: "6", order: 6, name: 'Strings'},
		{_id: "7", order: 7, name: 'Harmonica'},
		{_id: "8", order: 8, name: 'Piano'},
		{_id: "9", order: 9, name: 'Keyboard'}
	];

	const genres = [
		{_id: "0", order: 0, name: 'Rock'},
		{_id: "1", order: 1, name: 'RnB'},
		{_id: "2", order: 2, name: 'Pop'},
		{_id: "3", order: 3, name: 'Blues'},
		{_id: "4", order: 4, name: 'Country'},
		{_id: "5", order: 5, name: 'Electronic'},
		{_id: "6", order: 6, name: 'Folk'},
		{_id: "7", order: 7, name: 'Hip Hop'},
		{_id: "8", order: 8, name: 'Jazz'},
		{_id: "9", order: 9, name: 'World'}
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

	    // --------------------------------- GETS ---------------------------------
	    describe('#gets', () => {
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
		    		ins.order = instruments[i].order;
		    		ins.name = instruments[i].name;
		    		ins.save((err) => {
		    			if (err) throw err;
		    		});
		    	}

		    	for (var i = 0; i < genres.length; i++) {
		    		let gen = new genre();
		    		gen.order = genres[i].order;
		    		gen.name = genres[i].name;
		    		gen.save((err) => {
		    			if (err) throw err;
		    		});
		    	}
		    	done();
	    	});


			/*
			* Author: Elvar
			* Signees: Dagur, Bergþór
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
									res.body[i].should.have.property('order').which.is.equal(instruments[i].order);
									res.body[i].should.have.property('name').which.is.equal(instruments[i].name);
								}
								done();
							});
					});
			});

			/*
			* Author: Elvar
			* Signees: Dagur, Bergþór
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
									res.body[i].should.have.property('order').which.is.equal(genres[i].order);
									res.body[i].should.have.property('name').which.is.equal(genres[i].name);
								}
								done();
							});
					});
			});
		});

		// --------------------------------- POSTS ---------------------------------
		describe('#posts', () => {
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
		    		ins.order = instruments[i].order;
		    		ins.name = instruments[i].name;
		    		ins.save((err) => {
		    			if (err) throw err;
		    		});
		    	}

		    	for (var i = 0; i < genres.length; i++) {
		    		let gen = new genre();
		    		gen.order = genres[i].order;
		    		gen.name = genres[i].name;
		    		gen.save((err) => {
		    			if (err) throw err;
		    		});
		    	}
		    	done();
	    	});

			/*
			* Author: Elvar
			* Signees: Bergþór
			*/
			it('should post instruments', function(done) {
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
							.end((err, rGet) => {
								var pickedInstruments = [rGet.body[0]._id, rGet.body[1]._id, rGet.body[2]._id]
								agent
									.post('/instruments')
									.expect(201)
									.send(pickedInstruments)
									.end((err, rPost) => {
										if (err) throw err;
										user.findOne({"local.username": "TestPerson"}, function(err, doc) {
											if (err) throw err;
											doc.instruments.length.should.equal(pickedInstruments.length);

											for (var i = 0; i < doc.instruments.length; i++) {
												doc.instruments.indexOf(pickedInstruments[i]).should.not.equal(-1);
											}
										});
										done();
									});
								if (err) throw err;
							});
					});
			});

			/*
			* Author: Elvar
			* Signees: Bergþór
			*/
			it('should post genres', function(done) {
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
							.end((err, rGet) => {
								var pickedGenres = [rGet.body[0]._id, rGet.body[1]._id, rGet.body[2]._id]
								agent
									.post('/genres')
									.expect(201)
									.send(pickedGenres)
									.end((err, resPost) => {
										if (err) throw err;
										user.findOne({"local.username": "TestPerson"}, function(err, doc) {
											if (err) throw err;
											doc.genres.length.should.equal(pickedGenres.length);

											for (var i = 0; i < doc.genres.length; i++) {
												doc.genres.indexOf(pickedGenres[i]).should.not.equal(-1);
											}
										});
										done();
									});
								if (err) throw err;
							});
					});
			});
		});
	});
};