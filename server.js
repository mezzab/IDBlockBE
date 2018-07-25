// server.js
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
require("./app/routes")(app, {});
app.listen(port, () => {
  console.log("We are live on " + port);
});

// MongoClient.connect(
//   db.url,
//   (err, database) => {
//     if (err) return console.log(err);
//     require("./app/routes")(app, database);
//     app.listen(port, () => {
//       console.log("We are live on " + port);
//     });
//   }
// );
