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

    console.log("✓ Backend escuchando en puerto " + port);
    console.log(' ')
    console.log(' ')
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    console.log("✓ Conectado a ganache!");

    web3.eth.getAccounts(function (error, accounts) {
        console.log(" > Las cuentas ganache son: ");
        accounts.map((x, i) => console.log('  ' + i + ') ' + x))
        console.log(" > La cuenta a utilizar sera: ");
        console.log('  0)' + accounts[0])
        web3.eth.defaultAccount = accounts[0];
        console.log(' ')
        console.log(' ')
    })

    // Blockchain Routes - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    app.get('/initSmartContract', (req, res) => {
        console.log('> Building and deploying smart contract... ');

        startSmartContract()
            .then(() => {
                res.send('EXITO');
            })
            .catch(err => {
                res.send('ERROR: ', err);
            });
    });

    app.get('/voteRama', (req, res) => {
        voteRama(0)
            .then(() => {
                res.send('EXITO');
            })
            .catch(err => {
                res.send('ERROR: ', err);
            });
    });

    app.get('/voteNick', (req, res) => {
        voteNick(0)
            .then(() => {
                res.send('EXITO');
            })
            .catch(err => {
                res.send('ERROR: ', err);
            });
    });

});

let abi;
let bytecode;
let contractInstance;
let rama;
let nick;
let jose;

async function startSmartContract() {
    let accounts = await web3.eth.getAccounts();

    console.log("   Buscando smart contract Voting.sol.");

    let helloPath = path.resolve(__dirname, 'contracts', 'Voting.sol');
    let code = fs.readFileSync(helloPath, 'UTF-8').toString();
    let compiledCode = solc.compile(code, 1);
    abi = JSON.parse(compiledCode.contracts[':Voting'].interface);
    bytecode = compiledCode.contracts[':Voting'].bytecode;
    console.log("   Compilando smart contrat.");

    let votingContract = new web3.eth.Contract(abi, { from: accounts[0], gas: 47000, data: bytecode });

    rama = web3.utils.asciiToHex('Rama');
    nick = web3.utils.asciiToHex('Nick');
    jose = web3.utils.asciiToHex('Jose');
    console.log("   Deployando smart contrat.");
    contractInstance = await votingContract.deploy({
        arguments: [[rama, nick, jose]]
    })
        .send({
            from: accounts[0],
            gas: 1500000
        }, (err, txHash) => {
            // console.log('send:', err, txHash);
        })
        .on('error', (err) => {
            console.log('error:', err);
        })
        .on('transactionHash', (err) => {
            // console.log('transactionHash:', err);
        })
        .on('receipt', (receipt) => {
            // console.log('receipt:', receipt);
            votingContract.options.address = receipt.contractAddress;
        });

    // console.log('contractInstance.options:', contractInstance.options);

    console.log("✓ Completado!");
    let ramaresult = await contractInstance.methods.totalVotesFor(rama).call({ from: accounts[0] });
    let nickresult = await contractInstance.methods.totalVotesFor(nick).call({ from: accounts[0] });
    let joseresult = await contractInstance.methods.totalVotesFor(jose).call({ from: accounts[0] });
    console.log('> Datos del smart contract:')
    console.log('   El resultado para rama es de :', ramaresult);
    console.log('   El resultado para nick es de :', nickresult);
    console.log('   El resultado para jose es de :', joseresult);
}

async function voteRama(n) {
    let accounts = await web3.eth.getAccounts();

    let receipt = await contractInstance.methods.voteForCandidate(rama).send({ from: accounts[n] });
    console.log('voteForCandidate receipt:', receipt);

    let ramaresult = await contractInstance.methods.totalVotesFor(rama).call({ from: accounts[0] });
    let nickresult = await contractInstance.methods.totalVotesFor(nick).call({ from: accounts[0] });
    let joseresult = await contractInstance.methods.totalVotesFor(jose).call({ from: accounts[0] });
    console.log('El resultado para rama es de :', ramaresult);
    console.log('El resultado para nick es de :', nickresult);
    console.log('El resultado para jose es de :', joseresult);
}

async function voteNick(n) {
    let accounts = await web3.eth.getAccounts();

    let receipt = await contractInstance.methods.voteForCandidate(nick).send({ from: accounts[n] });
    console.log('voteForCandidate receipt:', receipt);

    let ramaresult = await contractInstance.methods.totalVotesFor(rama).call({ from: accounts[0] });
    let nickresult = await contractInstance.methods.totalVotesFor(nick).call({ from: accounts[0] });
    let joseresult = await contractInstance.methods.totalVotesFor(jose).call({ from: accounts[0] });
    console.log('El resultado para rama es de :', ramaresult);
    console.log('El resultado para nick es de :', nickresult);
    console.log('El resultado para jose es de :', joseresult);
}

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
