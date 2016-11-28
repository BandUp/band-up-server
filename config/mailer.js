const nodemailer = require("nodemailer");

class Mailer{

    constructor(){

    }

    /**
     * reset connection to google to elimate lost connections
     */
    startTransporter(){
        this.transporter = nodemailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: "gmailID",
                pass: "password"
            }
        });
    }

    sendPaswordReset(user){
        startTransporter();
        let url = "http://band-up-server.herokuapp.com/reset-password/" + user.resetToken;
        let mailOptions = {
            from: "Bad melody <support@badmelody.com>",
            to: user.email,
            subject: "Password reset",
            text: "please go to this address to reset your password: " + url,
            html: '<p>please click <a href="' + url + '">this</a> to reset your password</p>'
        };

        this.transporter.sendMail(mailOptions, (err, info) =>{
            if(err) throw err;
            console.log("password reset message sent");
        });
    }

    sendValidationEmail(user){
        startTransporter();
        let mailOptions = {
            from: "Bad melody <support@badmelody.com>",
            to: user.email,
            subject: "Password reset",
            text: "Plaintext body",
            html: "<p>html body</p>"
        };

        this.transporter.sendMail(mailOptions, (err, info) =>{
            if(err) throw err;
            console.log("password reset message sent");
        });
    }
}

module.exports = new Mailer();
