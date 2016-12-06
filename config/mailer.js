const nodemailer = require("nodemailer");


class Mailer{

    constructor(){

    }

    /**
     * reset connection to google to elimate lost connections
     */
    startTransporter(){
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth:{
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });
    }

    sendPaswordReset(user){
        this.startTransporter();
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
        this.startTransporter();
        let url = "http://band-up-server.herokuapp.com/validate/" + user.resetToken;
        let mailOptions = {
            from: "Bad melody <support@badmelody.com>",
            to: user.email,
            subject: "Password reset",
            text: "please go to this address to validate your account: " + url,
            html: '<p>please click <a href="' + url + '">this</a> to validate your account</p>'
        };

        this.transporter.sendMail(mailOptions, (err, info) =>{
            if(err) throw err;
            console.log("password reset message sent");
        });
    }
}

module.exports = new Mailer();
