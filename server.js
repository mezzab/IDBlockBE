// server.js
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");
const Web3 = require("web3");

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
require("./app/routes")(app, {});
app.listen(port, () => {
console.log("We are live on " + port);

 	//if (typeof web3 !== 'undefined') {
  	//web3 = new Web3(web3.currentProvider);
	//} else {
  	//web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	//}

var Eth = require('web3-eth');
var eth = new Eth(Eth.givenProvider || "http://localhost:8545");
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

console.log("Las cuentas ganache son:");
web3.eth.getAccounts(console.log);
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
