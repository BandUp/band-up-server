const gcm = require('node-gcm');

class gcmSender{
  constructor(){
    this.sender = new gcm.Sender(process.env.GOOGLE_SERVER_KEY);
  }

  sendTestMessage(regTokens){
    let message = new gcm.Message({
      data: {key1: "Hello world!"}
    });

    this.sender.send(message, {registrationTokens: regTokens}, (err, response) => {
      if(err) console.error(err);
      else    console.log(response);
    });
  }
}

module.exports = new gcmSender();
