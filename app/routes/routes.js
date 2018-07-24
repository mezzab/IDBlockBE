module.exports = function(app, db) {
  const collection = app.post("/saveUserInSC", (req, res) => {
    // const note = { text: req.body.body, title: req.body.title };
    // db.collection('notes').insert(note, (err, result) => {
    //   if (err) {
    //     res.send({ 'error': 'An error has occurred' });
    //   } else {
    //     res.send(result.ops[0]);
    //   }
    // });
    res.send("no implementamos esto todavia guacho");
  });

  app.post("/sendEmail", (req, res) => {
    console.log(req.body);

    // We will send an email here

    res.send({ code: "123123" });
    // example db
    //   const note = { text: req.body.body, title: req.body.title}
    //   db.collection('notes').insert(note, (err, results) => {
    // }
  });
};
