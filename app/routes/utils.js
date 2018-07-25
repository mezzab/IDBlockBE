module.exports = {
  randomCode: function() {
    return Math.floor(Math.random() * 999999);
  },
  mailOptions: function(mail, code) {
    return {
      from: "idblocktest@gmail.com",
      to: mail,
      subject: "Tu código de verificación de IDBlock",
      html: `<p> Tu código de verificaciónes: <b>${code}</b> <p>Este código caducará en 10 minutos.  </p> </p>`
    };
  }
};
