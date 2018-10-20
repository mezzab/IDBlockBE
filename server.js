// server.js
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");
const Web3 = require("web3");
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
require("./app/routes")(app, {});
app.listen(port, () => {
console.log("We are live on " + port);



const helloPath = path.resolve(__dirname, 'contracts', 'hello.sol');
const source = fs.readFileSync(helloPath, 'UTF-8');

console.log(solc.compile(source,1))
module.exports = solc.compile(source, 1).contracts[':Hello'];




 	if (typeof web3 !== 'undefined') {
  	web3 = new Web3(web3.currentProvider);
	} else {
  	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}

//var Eth = require('web3-eth');
//var eth = new Eth(Eth.givenProvider || "http://localhost:8545");
//var Web3 = require('web3');
//var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");


web3.eth.getAccounts(function(error, accounts) {
 	console.log("Las cuentas ganache son:");
     	console.log(accounts);
	web3.eth.defaultAccount = accounts[0];
	console.log("La cuenta a utilizar sera:");
	console.log(web3.eth.defaultAccount);
    })

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
