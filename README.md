[![Build Status](https://travis-ci.org/BandUp/band-up-server.svg?branch=master)](https://travis-ci.org/BandUp/band-up-server)
# band-up-server
A backend server for band up

## set-up
use `npm install` to download and set up all dependencies

and use `npm start` to run the server (or `node index.js` is you prefer but that might change)

to run tests use the `mocha` command

## api overview
* **/signup-local**

  Create new user with the local strategy
* **Method:**
  

  `POST`

* **Data Params**

  {
  
      username: String
      
      password: String
      
      email: String
      
      dateOfBirth: Date
      
  }

* **Success Response:**
  
  * **Code:** 201 <br />
    **Content:** `{ id : userID }`
 
* **Error Response:**


  * **Code:** 401 UNAUTHORIZED <br />

* **Notes:**

  None for this call
  
##

* **/login-local**

  Log in as user with the local strategy
* **Method:**
  

  `POST`

* **Data Params**

  {
  
      username: String
      
      password: String
     
      
  }

* **Success Response:**
  
  * **Code:** 200 <br />
    **Content:** `{ sessionID: session token, 
    
    userID:  String
    
    hasFinishedSetup: bool // indicatior wheter user setup (instruments and genres) has been completed
    
    }`
 
* **Error Response:**


  * **Code:** 401 UNAUTHORIZED <br />

* **Notes:**

    None for this call
  
##


* **/login-facebook**

  Create new user with the facebook strategy
* **Method:**
  

  `POST`

* **Data Params**

  please refer to facebook passport.js strategy

* **Success Response:**
  
  * **Code:** 201 <br />
    **Content:** `{ sessionID: session token, 
    
    userID:  String
    
    hasFinishedSetup: bool // indicatior wheter user setup (instruments and genres) has been completed
    
    }`
 
* **Error Response:**


  * **Code:** 401 UNAUTHORIZED <br />

* **Notes:**

  None for this call
  
##


* **/login-google**

  Create new user with the google strategy
* **Method:**
  

  `POST`

* **Data Params**

  please refer to google passport.js strategy

* **Success Response:**
  
  * **Code:** 201 <br />
    **Content:** `{ sessionID: session token, 
    
    userID:  String
    
    hasFinishedSetup: bool // indicatior wheter user setup (instruments and genres) has been completed
    
    }`
 
* **Error Response:**


  * **Code:** 401 UNAUTHORIZED <br />

* **Notes:**

  None for this call
