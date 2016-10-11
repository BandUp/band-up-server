const dbURI 		= process.env.MONGO_TEST;
const mongoose 		= require('mongoose');
const assert	 	= require('assert');
const should 		= require('should');
const request 		= require('supertest');
const clearDB 		= require('mocha-mongoose')(dbURI);
const user 			= require('../models/user');
const instrument 	= require('../models/instrument');
const genre 		= require('../models/genre');

module.exports = function(app){

  describe('user handling', function(){
    describe('#editing', function () {
      it('should return the full user object', function (done) {
        
        done();
      });
    });
  });
};
