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
          "Email sent to" +
            req.body.mail +
            ", with code:---" +
            code +
            "---.Extra info:" +
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
};
