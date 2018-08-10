var nodemailer = require("nodemailer");
var develop = require("../../config/develop");
var utils = require("./utils");

module.exports = function(app, db) {
  app.post("/sendEmail", (req, res) => {
    var transporter = nodemailer.createTransport({
      service: develop.mail.service,
      auth: {
        user: develop.mail.user,
        pass: develop.mail.pass
      }
    });

    var code = utils.randomCode();

    transporter.sendMail(utils.mailOptions(req.body.mail, code), function(
      error,
      info
    ) {
      if (error) {
        console.log("Error sending mail: ", error);
      } else {
        console.log(
          "Email sent to: " +
            req.body.mail +
            ". Verification code: *** " +
            code +
            " *** .Extra info:" +
            info.response
        );
      }
    });

    res.send({ code });

    /* lo ideal seria guardar el codigo en una db con el mail
      y cuando el user presiona continuar abria que pegarle de nuevo al back con el codigo
      para que el verifique si es el que guardo en la db.*/
  });

  app.post("/saveUserInSmartContract", (req, res) => {
    res.send("no implementamos esto todavia guacho");
  });

  app.post("/sendSMS", (req, res) => {
    console.log("***SMS***")
    var accountSid = 'AC42a878de00f204d7a78f93ffaffbe634'; // Your Account SID from www.twilio.com/console
    var authToken = 'c9b595de419ae8f43ccfe2030211928d';   // Your Auth Token from www.twilio.com/console

    var twilio = require('twilio');
    var client = new twilio(accountSid, authToken);

    client.messages.create({
    body: 'Hello from Node',
    to: '+541158833086',  // Text this number
    from: '+15866661838' // From a valid Twilio number
    })
   .then((message) => console.log(message.sid));
  });
};
