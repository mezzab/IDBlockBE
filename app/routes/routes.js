var nodemailer = require("nodemailer");
module.exports = function(app, db) {
  app.post("/sendEmail", (req, res) => {
    //todo: generar un codigo automaticamente
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "idblocktest@gmail.com",
        pass: "marcoszxc"
      }
    });

    var mailOptions = {
      from: "idblocktest@gmail.com",
      to: req.body.mail,
      subject: "Tu código de verificación de IDBlock",
      html:
        "<p> Tu codigo de verificacion es: <b>123123</b> <p>Este código caducará en 10 minutos.  </p> </p>"
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent to" + req.body.mail + info.response);
      }
    });

    res.send({ code: "123123" });
    /* lo ideal seria guardar el codigo en una db con el mail
      y cuando el user presiona continuar abria que pegarle de nuevo al back con el codigo
      para que el verifique si es el que guardo en la db.*/
  });

  app.post("/saveUserInSmartContract", (req, res) => {
    res.send("no implementamos esto todavia guacho");
  });
};
