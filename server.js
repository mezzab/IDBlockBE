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

 	if (typeof web3 !== 'undefined') {
  	web3 = new Web3(web3.currentProvider);
	} else {
  	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}
	console.log("Conectado a ganache");
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
	async function deploy() {
		let accounts = await web3.eth.getAccounts();

		console.log("Buscando smart contract Voting.sol");
		let helloPath = path.resolve(__dirname, 'contracts', 'Voting.sol');
		let code = fs.readFileSync(helloPath, 'UTF-8').toString();
		let compiledCode = solc.compile(code, 1);
		let abi = JSON.parse(compiledCode.contracts[':Voting'].interface);
		let bytecode = compiledCode.contracts[':Voting'].bytecode;
		
		let votingContract = new web3.eth.Contract(abi, {from: accounts[0], gas: 47000, data: bytecode});

		let rama = web3.utils.asciiToHex('Rama');
		let nick = web3.utils.asciiToHex('Nick');
		let jose = web3.utils.asciiToHex('Jose');


		let contractInstance = await votingContract.deploy({
        arguments: [[rama, nick, jose]]
    })
    .send({
        from: accounts[0],
        gas: 1500000
    }, (err, txHash) => {
        console.log('send:', err, txHash);
    })
    .on('error', (err) => {
        console.log('error:', err);
    })
    .on('transactionHash', (err) => {
        console.log('transactionHash:', err);
    })
    .on('receipt', (receipt) => {
        console.log('receipt:', receipt);
        votingContract.options.address = receipt.contractAddress;
    });

    console.log('contractInstance.options:', contractInstance.options);

    let result = await votingContract.methods.totalVotesFor(rama).call({from: accounts[0]});
    console.log('result:', result); // 0

    let receipt = await votingContract.methods.voteForCandidate(rama).send({from: accounts[0]});
    console.log('voteForCandidate receipt:', receipt);

    result = await votingContract.methods.totalVotesFor(rama).call({from: accounts[0]});
    console.log('new result:', result); // 1
	}

	deploy()
.then(() => console.log('Success'))
.catch(err => console.log('Script failed:', err));

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
